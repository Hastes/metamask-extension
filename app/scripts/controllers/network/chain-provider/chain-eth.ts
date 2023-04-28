import BN from 'bn.js';
import Eth from 'ethjs';
import EthContract from 'ethjs-contract';
import { publicToAddress, arrToBufArr, addHexPrefix } from 'ethereumjs-util';
import abi from 'human-standard-token-abi';
import { HDKey } from 'ethereum-cryptography/hdkey';

import {
  toChecksumHexAddress,
  ERC20,
  ERC721_INTERFACE_ID,
} from '@metamask/controller-utils';
import {
  isBurnAddress,
  isValidHexAddress,
} from '../../../../../shared/modules/hexstring-utils';

import {
  fetchTokenMetadata,
  TOKEN_METADATA_NO_SUPPORT_ERROR,
} from '../../../../overrided-metamask/assets-controllers/token-service';
import contractsMap from '../../../../overrided-metamask/contract-metadata';
import { formatIconUrlWithProxy } from '../../../../overrided-metamask/assets-controllers/assetsUtil';
import { TokenListToken } from '../../../../overrided-metamask/assets-controllers/TokenListController';

import { CHAIN_ID_TO_RPC_URL_MAP } from '../../../../../shared/constants/network';
import { parseStandardTokenTransactionData } from '../../../../../shared/modules/transaction.utils';
import { getTokenIdParam } from '../../../../../shared/lib/token-util';
import { getTokenValueParam } from '../../../../../shared/lib/metamask-controller-utils';
import { calcTokenAmount } from '../../../../../shared/lib/transactions-controller-utils';

import { generateERC20TransferData } from '../../../../../ui/pages/send/send.utils';
import { getTokenAddressParam } from '../../../../../ui/helpers/utils/token-util';
import ChainProvider from './interface';

import { ProviderConfig, ChainAccount } from './index.d';

export default class ChainEth implements ChainProvider {
  client: typeof Eth;

  provider: ProviderConfig;

  contract?: typeof EthContract = null;

  defaultSymbol = 'ETH';

  defaultDecimals = 18;

  defaultIconUrl =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/1257px-Ethereum_logo_2014.svg.png';

  constructor(provider: ProviderConfig) {
    const rpcUrl = (CHAIN_ID_TO_RPC_URL_MAP as any)[provider.chainId];
    this.client = new Eth(new Eth.HttpProvider(rpcUrl));
    this.provider = provider;

    if (provider.contract) {
      const contract = new EthContract(this.client);
      this.contract = contract(abi).at(provider.contract);
    }
  }

  get decimals() {
    return this.provider.decimals || this.defaultDecimals;
  }

  async getBalance(address: string): Promise<string> {
    let result;
    if (this.contract) {
      result = await this.contract.balanceOf(address);
      if (!result) {
        throw new Error('Could not get balance from rpc');
      }
      return (result[0] as BN).toString();
    }
    result = await this.client.getBalance(address);
    return result;
  }

  getAccount(hdKey: HDKey) {
    if (!hdKey.publicKey) {
      throw new Error('No public key');
    }
    const pubKey = arrToBufArr(hdKey.publicKey);
    const address = publicToAddress(pubKey, true).toString('hex');
    return { address: addHexPrefix(address) };
  }

  async simpleSend(account: ChainAccount, to: string, amount: BN) {
    // not implemented
  }

  /**
   * Check string is valid address
   *
   * @param address - account address
   */
  isAddress(address: string): boolean {
    const isAddress = !isBurnAddress(address);
    isValidHexAddress(address, {
      mixedCaseUseChecksum: true,
    });
    return isAddress;
  }

  generateTokenTransferData(transferParams: any) {
    return generateERC20TransferData(transferParams);
  }

  parseTokenTransferData(transactionData: string) {
    const tokenData = parseStandardTokenTransactionData(transactionData);
    if (!tokenData) {
      throw new Error('Unable to detect valid token data');
    }

    // Sometimes the tokenId value is parsed as "_value" param. Not seeing this often any more, but still occasionally:
    // i.e. call approve() on BAYC contract - https://etherscan.io/token/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d#writeContract, and tokenId shows up as _value,
    // not sure why since it doesn't match the ERC721 ABI spec we use to parse these transactions - https://github.com/MetaMask/metamask-eth-abis/blob/d0474308a288f9252597b7c93a3a8deaad19e1b2/src/abis/abiERC721.ts#L62.
    const tokenId = getTokenIdParam(tokenData)?.toString();

    const toAddress = getTokenAddressParam(tokenData);
    const tokenAmount =
      tokenData &&
      calcTokenAmount(getTokenValueParam(tokenData), this.decimals).toString(
        10,
      );
    return {
      toAddress,
      tokenAmount,
      tokenId,
    };
  }

  getStandard(): string | null {
    // TODO: improve it
    if (this.provider.contract) {
      return ERC20;
    }
    return null;
  }

  /**
   * Fetch metadata for a token.
   */
  async fetchTokenMetadata(): Promise<TokenListToken | undefined> {
    if (!this.provider.contract) {
      return undefined;
    }
    try {
      const token = await fetchTokenMetadata<TokenListToken>(
        this.provider.chainId,
      );
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
      return await this.contract.supportsInterface(ERC721_INTERFACE_ID);
    } catch (error: any) {
      // currently we see a variety of errors across different networks when
      // token contracts are not ERC721 compatible. We need to figure out a better
      // way of differentiating token interface types but for now if we get an error
      // we have to assume the token is not ERC721 compatible.
      return false;
    }
  }

  detectIconUrl() {
    return formatIconUrlWithProxy({
      chainId: this.provider.chainId,
      tokenAddress: this.provider.contract,
    });
  }
}
