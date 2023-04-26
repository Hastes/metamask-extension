import { EventEmitter } from 'events';
import { isEqual } from 'lodash';
import { v1 as random } from 'uuid';
import { Mutex } from 'async-mutex';
import { Contract } from '@ethersproject/contracts';

import {
  BaseController,
  BaseConfig,
  BaseState,
} from '@metamask/base-controller';
import type { PreferencesState } from '@metamask/preferences-controller';

import { toChecksumHexAddress } from '@metamask/controller-utils';
import { KeyringController } from '@metamask/eth-keyring-controller';
import {
  ProviderConfig,
  ChainProvider,
} from '../../scripts/controllers/network/chain-provider';
import type { Token } from './TokenRatesController';
import { formatAggregatorNames, validateTokenToWatch } from './assetsUtil';

/**
 * @type TokensConfig
 *
 * Tokens controller configuration
 * @property networkType - Network ID as per net_version
 * @property selectedAddress - Vault selected address
 */
export interface TokensConfig extends BaseConfig {
  selectedAddress: string;
}

/**
 * @type AssetSuggestionResult
 * @property result - Promise resolving to a new suggested asset address
 * @property suggestedAssetMeta - Meta information about this new suggested asset
 */
interface AssetSuggestionResult {
  result: Promise<string>;
  suggestedAssetMeta: SuggestedAssetMeta;
}

enum SuggestedAssetStatus {
  accepted = 'accepted',
  failed = 'failed',
  pending = 'pending',
  rejected = 'rejected',
}

export type SuggestedAssetMetaBase = {
  id: string;
  time: number;
  type: string;
  asset: Token;
};

/**
 * @type SuggestedAssetMeta
 *
 * Suggested asset by EIP747 meta data
 * @property error - Synthesized error information for failed asset suggestions
 * @property id - Generated UUID associated with this suggested asset
 * @property status - String status of this this suggested asset
 * @property time - Timestamp associated with this this suggested asset
 * @property type - Type type this suggested asset
 * @property asset - Asset suggested object
 */
export type SuggestedAssetMeta =
  | (SuggestedAssetMetaBase & {
      status: SuggestedAssetStatus.failed;
      error: Error;
    })
  | (SuggestedAssetMetaBase & {
      status:
        | SuggestedAssetStatus.accepted
        | SuggestedAssetStatus.rejected
        | SuggestedAssetStatus.pending;
    });

/**
 * @type TokensState
 *
 * Assets controller state
 * @property tokens - List of tokens associated with  address pair
 * @property ignoredTokens - List of ignoredTokens associated with  address pair
 * @property detectedTokens - List of detected tokens associated with  address pair
 * @property allTokens - Object containing tokens by account
 * @property allIgnoredTokens - Object containing hidden/ignored tokens by account
 * @property allDetectedTokens - Object containing tokens detected with non-zero balances
 * @property suggestedAssets - List of pending suggested assets to be added or canceled
 */
export interface TokensState extends BaseState {
  tokens: Token[];
  ignoredTokens: string[];
  detectedTokens: Token[];
  allTokens: { [key: string]: Token[] };
  allIgnoredTokens: { [key: string]: string[] };
  allDetectedTokens: { [key: string]: Token[] };
  suggestedAssets: SuggestedAssetMeta[];
}

/**
 * Controller that stores assets and exposes convenience methods
 */
export class TokensController extends BaseController<
  TokensConfig,
  TokensState
> {
  private mutex = new Mutex();

  private ethersProvider: any;

  private abortController: AbortController;

  private keyringController: any;

  private failSuggestedAsset(
    suggestedAssetMeta: SuggestedAssetMeta,
    error: unknown,
  ) {
    const failedSuggestedAssetMeta = {
      ...suggestedAssetMeta,
      status: SuggestedAssetStatus.failed,
      error,
    };
    this.hub.emit(
      `${suggestedAssetMeta.id}:finished`,
      failedSuggestedAssetMeta,
    );
  }

  /**
   * EventEmitter instance used to listen to specific EIP747 events
   */
  hub = new EventEmitter();

  /**
   * Name of this controller used during composition
   */
  override name = 'TokensController';

  /**
   * Creates a TokensController instance.
   *
   * @param options - The controller options.
   * @param options.onPreferencesStateChange - Allows subscribing to preference controller state changes.
   * @param options.config - Initial options used to configure this controller.
   * @param options.state - Initial state to set on this controller.
   * @param options.keyringController
   */
  constructor({
    keyringController,
    onPreferencesStateChange,
    config,
    state,
  }: {
    keyringController: KeyringController;
    onPreferencesStateChange: (
      listener: (preferencesState: PreferencesState) => void,
    ) => void;
    config?: Partial<TokensConfig>;
    state?: Partial<TokensState>;
  }) {
    super(config, state);

    this.keyringController = keyringController;

    this.defaultConfig = {
      selectedAddress: '',
      ...config,
    };

    this.defaultState = {
      tokens: [],
      ignoredTokens: [],
      detectedTokens: [],
      allTokens: {},
      allIgnoredTokens: {},
      allDetectedTokens: {},
      suggestedAssets: [],
      ...state,
    };

    this.initialize();
    this.abortController = new AbortController();

    onPreferencesStateChange(({ selectedAddress }) => {
      const { allTokens, allIgnoredTokens, allDetectedTokens } = this.state;
      this.configure({ selectedAddress });
      this.update({
        tokens: allTokens[selectedAddress] || [],
        ignoredTokens: allIgnoredTokens[selectedAddress] || [],
        detectedTokens: allDetectedTokens[selectedAddress] || [],
      });
    });
  }

  // _instantiateNewEthersProvider(): any {
  //   return new Web3Provider(this.config?.provider);
  // }

  /**
   * Adds a token to the stored token list.
   *
   * @param provider
   * @returns Current token list.
   */
  async addToken(provider: ProviderConfig): Promise<Token[]> {
    const releaseLock = await this.mutex.acquire();
    try {
      const { tokens, detectedTokens } = this.state;
      const newTokens: Token[] = [...tokens];

      const cp = new ChainProvider(provider);
      const keyring = await this.keyringController.getKeyringForAccount(
        this.config.selectedAddress,
      );

      const account = cp.getAccount(keyring.root.deriveChild(0));

      let tokenMetadata;
      let isERC721;
      if (provider.contract && 'fetchTokenMetadata' in cp.chain) {
        [isERC721, tokenMetadata] = await Promise.all([
          cp.chain.detectIsERC721(),
          cp.chain.fetchTokenMetadata(),
        ]);
      }
      const newEntry: Token = {
        account: account.address,
        provider,
        symbol: cp.symbol,
        decimals: cp.decimals,
        image: cp.iconUrl,
        isERC721,
        aggregators: formatAggregatorNames(tokenMetadata?.aggregators || []),
      };
      const previousEntry = newTokens.find((token) =>
        isEqual(token.provider, provider),
      );
      if (previousEntry) {
        const previousIndex = newTokens.indexOf(previousEntry);
        newTokens[previousIndex] = newEntry;
      } else {
        newTokens.push(newEntry);
      }
      const newDetectedTokens = detectedTokens.filter((token) =>
        isEqual(token.provider, provider),
      );

      const { newAllTokens, newAllIgnoredTokens, newAllDetectedTokens } =
        this._getNewAllTokensState({
          newTokens,
          newDetectedTokens,
        });

      this.update({
        tokens: newTokens,
        detectedTokens: newDetectedTokens,
        allTokens: newAllTokens,
        allIgnoredTokens: newAllIgnoredTokens,
        allDetectedTokens: newAllDetectedTokens,
      });
      return newTokens;
    } finally {
      releaseLock();
    }
  }

  /**
   * Add a batch of tokens.
   *
   * @param tokensToImport - Array of tokens to import.
   */
  async addTokens(tokensToImport: Token[]) {
    const releaseLock = await this.mutex.acquire();
    const { tokens, detectedTokens, ignoredTokens } = this.state;
    const importedTokensMap: { [key: string]: true } = {};
    // Used later to dedupe imported tokens
    const newTokensMap = tokens.reduce((output, current) => {
      output[current.address] = current;
      return output;
    }, {} as { [address: string]: Token });

    try {
      tokensToImport.forEach((tokenToAdd) => {
        const { address, symbol, decimals, image, aggregators } = tokenToAdd;
        const checksumAddress = toChecksumHexAddress(address);
        const formattedToken: Token = {
          address: checksumAddress,
          symbol,
          decimals,
          image,
          aggregators,
        };
        newTokensMap[address] = formattedToken;
        importedTokensMap[address.toLowerCase()] = true;
        return formattedToken;
      });
      const newTokens = Object.values(newTokensMap);

      const newDetectedTokens = detectedTokens.filter(
        (token) => !importedTokensMap[token.address.toLowerCase()],
      );
      const newIgnoredTokens = ignoredTokens.filter(
        (tokenAddress) => !newTokensMap[tokenAddress.toLowerCase()],
      );

      const { newAllTokens, newAllDetectedTokens, newAllIgnoredTokens } =
        this._getNewAllTokensState({
          newTokens,
          newDetectedTokens,
          newIgnoredTokens,
        });

      this.update({
        tokens: newTokens,
        allTokens: newAllTokens,
        detectedTokens: newDetectedTokens,
        allDetectedTokens: newAllDetectedTokens,
        ignoredTokens: newIgnoredTokens,
        allIgnoredTokens: newAllIgnoredTokens,
      });
    } finally {
      releaseLock();
    }
  }

  /**
   * Ignore a batch of tokens.
   *
   * @param tokenAddressesToIgnore - Array of token addresses to ignore.
   */
  ignoreTokens(tokenAddressesToIgnore: string[]) {
    const { ignoredTokens, detectedTokens, tokens } = this.state;
    const ignoredTokensMap: { [key: string]: true } = {};
    let newIgnoredTokens: string[] = [...ignoredTokens];

    const checksummedTokenAddresses = tokenAddressesToIgnore.map((address) => {
      const checksumAddress = toChecksumHexAddress(address);
      ignoredTokensMap[address.toLowerCase()] = true;
      return checksumAddress;
    });
    newIgnoredTokens = [...ignoredTokens, ...checksummedTokenAddresses];
    const newDetectedTokens = detectedTokens.filter(
      (token) => !ignoredTokensMap[token.address.toLowerCase()],
    );
    const newTokens = tokens.filter(
      (token) => !ignoredTokensMap[token.address.toLowerCase()],
    );

    const { newAllIgnoredTokens, newAllDetectedTokens, newAllTokens } =
      this._getNewAllTokensState({
        newIgnoredTokens,
        newDetectedTokens,
        newTokens,
      });

    this.update({
      ignoredTokens: newIgnoredTokens,
      tokens: newTokens,
      detectedTokens: newDetectedTokens,
      allIgnoredTokens: newAllIgnoredTokens,
      allDetectedTokens: newAllDetectedTokens,
      allTokens: newAllTokens,
    });
  }

  /**
   * Adds a batch of detected tokens to the stored token list.
   *
   * @param incomingDetectedTokens - Array of detected tokens to be added or updated.
   * @param detectionDetails - An object containing the chain ID and address of the currently selected network on which the incomingDetectedTokens were detected.
   * @param detectionDetails.selectedAddress - the account address on which the incomingDetectedTokens were detected.
   * @param detectionDetails.chainId - the chainId on which the incomingDetectedTokens were detected.
   */
  async addDetectedTokens(
    incomingDetectedTokens: Token[],
    detectionDetails?: { selectedAddress: string; chainId: string },
  ) {
    const releaseLock = await this.mutex.acquire();
    const { tokens, detectedTokens, ignoredTokens } = this.state;
    const newTokens: Token[] = [...tokens];
    let newDetectedTokens: Token[] = [...detectedTokens];

    try {
      incomingDetectedTokens.forEach((tokenToAdd) => {
        const { address, symbol, decimals, image, aggregators, isERC721 } =
          tokenToAdd;
        const checksumAddress = toChecksumHexAddress(address);
        const newEntry: Token = {
          address: checksumAddress,
          symbol,
          decimals,
          image,
          isERC721,
          aggregators,
        };
        const previousImportedEntry = newTokens.find(
          (token) =>
            token.address.toLowerCase() === checksumAddress.toLowerCase(),
        );
        if (previousImportedEntry) {
          // Update existing data of imported token
          const previousImportedIndex = newTokens.indexOf(
            previousImportedEntry,
          );
          newTokens[previousImportedIndex] = newEntry;
        } else {
          const ignoredTokenIndex = ignoredTokens.indexOf(address);
          if (ignoredTokenIndex === -1) {
            // Add detected token
            const previousDetectedEntry = newDetectedTokens.find(
              (token) =>
                token.address.toLowerCase() === checksumAddress.toLowerCase(),
            );
            if (previousDetectedEntry) {
              const previousDetectedIndex = newDetectedTokens.indexOf(
                previousDetectedEntry,
              );
              newDetectedTokens[previousDetectedIndex] = newEntry;
            } else {
              newDetectedTokens.push(newEntry);
            }
          }
        }
      });

      const { selectedAddress: detectionAddress, chainId: detectionChainId } =
        detectionDetails || {};

      const { newAllTokens, newAllDetectedTokens } = this._getNewAllTokensState(
        {
          newTokens,
          newDetectedTokens,
          detectionAddress,
          detectionChainId,
        },
      );

      const { chainId, selectedAddress } = this.config;
      // if the newly added detectedTokens were detected on (and therefore added to) a different chainId/selectedAddress than the currently configured combo
      // the newDetectedTokens (which should contain the detectedTokens on the current chainId/address combo) needs to be repointed to the current chainId/address pair
      // if the detectedTokens were detected on the current chainId/address then this won't change anything.
      newDetectedTokens =
        newAllDetectedTokens?.[chainId]?.[selectedAddress] || [];

      this.update({
        tokens: newTokens,
        allTokens: newAllTokens,
        detectedTokens: newDetectedTokens,
        allDetectedTokens: newAllDetectedTokens,
      });
    } finally {
      releaseLock();
    }
  }

  /**
   * Adds isERC721 field to token object. This is called when a user attempts to add tokens that
   * were previously added which do not yet had isERC721 field.
   *
   * @param tokenAddress - The contract address of the token requiring the isERC721 field added.
   * @returns The new token object with the added isERC721 field.
   */
  async updateTokenType(tokenAddress: string) {
    const isERC721 = await this._detectIsERC721(tokenAddress);
    const { tokens } = this.state;
    const tokenIndex = tokens.findIndex((token) => {
      return token.address.toLowerCase() === tokenAddress.toLowerCase();
    });
    tokens[tokenIndex].isERC721 = isERC721;
    this.update({ tokens });
    return tokens[tokenIndex];
  }

  _createEthersContract(
    tokenAddress: string,
    abi: string,
    ethersProvider: any,
  ): Contract {
    const tokenContract = new Contract(tokenAddress, abi, ethersProvider);
    return tokenContract;
  }

  _generateRandomId(): string {
    return random();
  }

  /**
   * Adds a new suggestedAsset to state. Parameters will be validated according to
   * asset type being watched. A `<suggestedAssetMeta.id>:pending` hub event will be emitted once added.
   *
   * @param asset - The asset to be watched. For now only ERC20 tokens are accepted.
   * @param type - The asset type.
   * @returns Object containing a Promise resolving to the suggestedAsset address if accepted.
   */
  async watchAsset(asset: Token, type: string): Promise<AssetSuggestionResult> {
    const suggestedAssetMeta = {
      asset,
      id: this._generateRandomId(),
      status: SuggestedAssetStatus.pending as SuggestedAssetStatus.pending,
      time: Date.now(),
      type,
    };
    try {
      switch (type) {
        case 'ERC20':
          validateTokenToWatch(asset);
          break;
        default:
          throw new Error(`Asset of type ${type} not supported`);
      }
    } catch (error) {
      this.failSuggestedAsset(suggestedAssetMeta, error);
      return Promise.reject(error);
    }

    const result: Promise<string> = new Promise((resolve, reject) => {
      this.hub.once(
        `${suggestedAssetMeta.id}:finished`,
        (meta: SuggestedAssetMeta) => {
          switch (meta.status) {
            case SuggestedAssetStatus.accepted:
              return resolve(meta.asset.address);
            case SuggestedAssetStatus.rejected:
              return reject(new Error('User rejected to watch the asset.'));
            case SuggestedAssetStatus.failed:
              return reject(new Error(meta.error.message));
            /* istanbul ignore next */
            default:
              return reject(new Error(`Unknown status: ${meta.status}`));
          }
        },
      );
    });

    const { suggestedAssets } = this.state;
    suggestedAssets.push(suggestedAssetMeta);
    this.update({ suggestedAssets: [...suggestedAssets] });
    this.hub.emit('pendingSuggestedAsset', suggestedAssetMeta);
    return { result, suggestedAssetMeta };
  }

  /**
   * Accepts to watch an asset and updates it's status and deletes the suggestedAsset from state,
   * adding the asset to corresponding asset state. In this case ERC20 tokens.
   * A `<suggestedAssetMeta.id>:finished` hub event is fired after accepted or failure.
   *
   * @param suggestedAssetID - The ID of the suggestedAsset to accept.
   */
  async acceptWatchAsset(suggestedAssetID: string): Promise<void> {
    const { suggestedAssets } = this.state;
    const index = suggestedAssets.findIndex(
      ({ id }) => suggestedAssetID === id,
    );
    const suggestedAssetMeta = suggestedAssets[index];
    try {
      switch (suggestedAssetMeta.type) {
        case 'ERC20':
          const { address, symbol, decimals, image } = suggestedAssetMeta.asset;
          await this.addToken(address, symbol, decimals, image);
          suggestedAssetMeta.status = SuggestedAssetStatus.accepted;
          this.hub.emit(
            `${suggestedAssetMeta.id}:finished`,
            suggestedAssetMeta,
          );
          break;
        default:
          throw new Error(
            `Asset of type ${suggestedAssetMeta.type} not supported`,
          );
      }
    } catch (error) {
      this.failSuggestedAsset(suggestedAssetMeta, error);
    }
    const newSuggestedAssets = suggestedAssets.filter(
      ({ id }) => id !== suggestedAssetID,
    );
    this.update({ suggestedAssets: [...newSuggestedAssets] });
  }

  /**
   * Rejects a watchAsset request based on its ID by setting its status to "rejected"
   * and emitting a `<suggestedAssetMeta.id>:finished` hub event.
   *
   * @param suggestedAssetID - The ID of the suggestedAsset to accept.
   */
  rejectWatchAsset(suggestedAssetID: string) {
    const { suggestedAssets } = this.state;
    const index = suggestedAssets.findIndex(
      ({ id }) => suggestedAssetID === id,
    );
    const suggestedAssetMeta = suggestedAssets[index];
    if (!suggestedAssetMeta) {
      return;
    }
    suggestedAssetMeta.status = SuggestedAssetStatus.rejected;
    this.hub.emit(`${suggestedAssetMeta.id}:finished`, suggestedAssetMeta);
    const newSuggestedAssets = suggestedAssets.filter(
      ({ id }) => id !== suggestedAssetID,
    );
    this.update({ suggestedAssets: [...newSuggestedAssets] });
  }

  /**
   * Takes a new tokens and ignoredTokens array for account
   * and returns new allTokens and allIgnoredTokens state to update to.
   *
   * @param params - Object that holds token params.
   * @param params.newTokens - The new tokens to set for selected account.
   * @param params.newIgnoredTokens - The new ignored tokens to set for selected account.
   * @param params.newDetectedTokens - The new detected tokens to set for selected account.
   * @param params.detectionAddress - The address on which the detected tokens to add were detected.
   * @returns The updated `allTokens` and `allIgnoredTokens` state.
   */
  _getNewAllTokensState(params: {
    newTokens?: Token[];
    newIgnoredTokens?: string[];
    newDetectedTokens?: Token[];
    detectionAddress?: string;
  }) {
    const { newTokens, newIgnoredTokens, newDetectedTokens, detectionAddress } =
      params;
    const { allTokens, allIgnoredTokens, allDetectedTokens } = this.state;
    const { selectedAddress } = this.config;

    const userAddressToAddTokens = detectionAddress ?? selectedAddress;

    let newAllTokens = allTokens;
    if (
      newTokens?.length ||
      (newTokens && allTokens && allTokens[userAddressToAddTokens])
    ) {
      newAllTokens = {
        ...allTokens,
        ...{ [userAddressToAddTokens]: newTokens },
      };
    }

    const newAllIgnoredTokens = allIgnoredTokens;
    if (
      newIgnoredTokens?.length ||
      (newIgnoredTokens &&
        allIgnoredTokens &&
        allIgnoredTokens[userAddressToAddTokens])
    ) {
      const newIgnoredNetworkTokens = {
        ...allIgnoredTokens,
        ...{ [userAddressToAddTokens]: newIgnoredTokens },
      };
    }

    let newAllDetectedTokens = allDetectedTokens;
    if (
      newDetectedTokens?.length ||
      (newDetectedTokens &&
        allDetectedTokens &&
        allDetectedTokens[userAddressToAddTokens])
    ) {
      newAllDetectedTokens = {
        ...allDetectedTokens,
        ...{ [userAddressToAddTokens]: newDetectedTokens },
      };
    }
    return { newAllTokens, newAllIgnoredTokens, newAllDetectedTokens };
  }

  /**
   * Removes all tokens from the ignored list.
   */
  clearIgnoredTokens() {
    this.update({ ignoredTokens: [], allIgnoredTokens: {} });
  }
}

export default TokensController;
