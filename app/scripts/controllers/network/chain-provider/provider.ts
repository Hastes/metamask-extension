import HdKeyring from '@metamask/eth-hd-keyring';

import contractsMap from '@metamask/contract-metadata';

import {
  toChecksumHexAddress,
  ERC721_INTERFACE_ID,
} from '@metamask/controller-utils';

import { NETWORK_TYPES } from '../../../../../shared/constants/network';

import {
  fetchTokenMetadata,
  TOKEN_METADATA_NO_SUPPORT_ERROR,
} from '../../../../overrided-metamask/assets-controllers/token-service';
import { formatIconUrlWithProxy } from '../../../../overrided-metamask/assets-controllers/assetsUtil';
import { TokenListToken } from '../../../../overrided-metamask/assets-controllers/TokenListController';
import { ProviderConfig } from './index.d';
import ChainBinance from './chain-binance';
import ChainTron from './chain-tron';
import ChainBitcoin from './chain-bitcoin';
import ChainEth from './chain-eth';

export class ChainProvider {
  readonly provider: ProviderConfig;

  readonly chain: ChainBinance | ChainBitcoin | ChainTron | ChainEth;

  readonly iconUrl: string;

  isERC721 = false;

  constructor(provider: ProviderConfig) {
    const CHAIN_BY_NETWORK = {
      [NETWORK_TYPES.MAINNET]: ChainEth,
      [NETWORK_TYPES.GOERLI]: ChainEth,
      [NETWORK_TYPES.SEPOLIA]: ChainEth,
      [NETWORK_TYPES.RPC]: ChainEth,
      [NETWORK_TYPES.LOCALHOST]: ChainEth,
      [NETWORK_TYPES.LINEA_TESTNET]: null,
      [NETWORK_TYPES.TRON]: ChainTron,
      [NETWORK_TYPES.BINANCE_CHAIN]: ChainBinance,
      [NETWORK_TYPES.BITCOIN]: ChainBitcoin,
    };

    this.provider = provider;

    const ChainClass = CHAIN_BY_NETWORK[provider.type];

    if (!ChainClass) {
      throw new Error(`Provider type ${provider.type} not implemented`);
    }

    this.chain = new ChainClass(provider);
    this.iconUrl = this.detectIconUrl();
  }

  get symbol(): string {
    return this.provider.symbol || this.chain.defaultSymbol;
  }

  get decimals(): number {
    return this.provider.decimals || this.chain.defaultDecimals;
  }

  getBalance(address: string, decimals: number) {
    return this.chain.getBalance(address, decimals);
  }

  getAccount(keyring: typeof HdKeyring) {
    return this.chain.getAccount(keyring);
  }

  isAddress(address: string) {
    return this.chain.isAddress(address);
  }

  async simpleSend(keyring: typeof HdKeyring, to: string, amount: string) {
    return this.chain.simpleSend(keyring, to, amount);
  }

  /**
   * Fetch metadata for a token.
   *
   * @param abortSignal - signal object from TokenProvider
   */
  async fetchTokenMetadata(): Promise<TokenListToken | undefined> {
    if (!this.provider.contract) {
      return undefined;
    }
    try {
      const token = await fetchTokenMetadata<TokenListToken>(
        this.provider.chainId,
      );
      debugger;
      return token;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes(TOKEN_METADATA_NO_SUPPORT_ERROR)
      ) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Detects whether or not a token is ERC-721 compatible.
   *
   * @returns A boolean indicating whether the token address passed in supports the EIP-721
   * interface.
   */
  async detectIsERC721(): Promise<boolean> {
    if (!this.provider.contract) {
      return false;
    }
    const checksumAddress = toChecksumHexAddress(this.provider.contract);
    // if this token is already in our contract metadata map we don't need
    // to check against the contract
    if (contractsMap[checksumAddress]?.erc721 === true) {
      return Promise.resolve(true);
    } else if (contractsMap[checksumAddress]?.erc20 === true) {
      return Promise.resolve(false);
    }

    try {
      return await this.chain.contract.supportsInterface(ERC721_INTERFACE_ID);
    } catch (error: any) {
      // currently we see a variety of errors across different networks when
      // token contracts are not ERC721 compatible. We need to figure out a better
      // way of differentiating token interface types but for now if we get an error
      // we have to assume the token is not ERC721 compatible.
      return false;
    }
  }

  private detectIconUrl() {
    if (!this.provider.contract) {
      return this.chain.defaultIconUrl;
    }
    return formatIconUrlWithProxy({
      chainId: this.provider.chainId,
      tokenAddress: this.provider.contract,
    });
  }
}
