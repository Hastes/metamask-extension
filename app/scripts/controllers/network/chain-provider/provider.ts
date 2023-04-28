import BN from 'bn.js';
import { HDKey } from 'ethereum-cryptography/hdkey';

import { stripHexPrefix } from '../../../../../shared/modules/hexstring-utils';
import {
  NETWORK_TYPES,
  CHAIN_IDS,
  TEST_CHAINS,
} from '../../../../../shared/constants/network';

import { ProviderConfig, ChainAccount, Fee } from './index.d';

import ChainTron from './chain-tron';
import ChainBitcoin from './chain-bitcoin';
import ChainEth from './chain-eth';
import ChainBsc from './chain-bsc';

const _hexToBn = (v: string) => {
  return new BN(stripHexPrefix(v), 16);
};

export class ChainProvider {
  readonly provider: ProviderConfig;

  readonly chain: ChainBitcoin | ChainTron | ChainEth;

  readonly nativeDecimals: number;

  readonly nativeSymbol: string;

  account: ChainAccount | null = null;

  isERC721 = false;

  constructor(provider: ProviderConfig) {
    const CHAIN_BY_ID = {
      [CHAIN_IDS.BSC]: ChainBsc,
      [CHAIN_IDS.BSC_TESTNET]: ChainBsc,
    };

    const CHAIN_BY_NETWORK = {
      [NETWORK_TYPES.MAINNET]: ChainEth,
      [NETWORK_TYPES.GOERLI]: ChainEth,
      [NETWORK_TYPES.SEPOLIA]: ChainEth,
      [NETWORK_TYPES.RPC]: ChainEth,
      [NETWORK_TYPES.LOCALHOST]: ChainEth,
      [NETWORK_TYPES.LINEA_TESTNET]: null,
      [NETWORK_TYPES.TRON]: ChainTron,
      [NETWORK_TYPES.BITCOIN]: ChainBitcoin,
      // beacon chain is deprecated
      // [NETWORK_TYPES.BINANCE_CHAIN]: ChainBinance,
    };

    const isTestnet = TEST_CHAINS.some(
      (chainId: string) => chainId === provider.chainId,
    );

    this.provider = provider;

    const ChainClass =
      (CHAIN_BY_ID as any)[provider.chainId] || CHAIN_BY_NETWORK[provider.type];

    if (!ChainClass) {
      throw new Error(`Provider type ${provider.type} not implemented`);
    }

    this.chain = new ChainClass(provider, isTestnet);

    this.nativeDecimals = this.chain.defaultDecimals;
    this.nativeSymbol = this.chain.defaultSymbol;
  }

  get symbol(): string {
    return this.provider.symbol || this.chain.defaultSymbol;
  }

  get decimals(): number {
    return this.provider.decimals || this.chain.defaultDecimals;
  }

  get iconUrl(): string {
    if (this.provider.iconUrl) {
      return this.provider.iconUrl;
    }
    if (this.provider.contract) {
      if ('detectIconUrl' in this.chain) {
        return this.chain.detectIconUrl();
      }
      return `https://cryptoicons.org/api/icon/${this.symbol.toLowerCase()}/200`;
    }
    return this.chain.defaultIconUrl;
  }

  async getBalance(address: string): Promise<BN> {
    const result = await this.chain.getBalance(address);
    const bn = new BN(result);
    return bn;
  }

  getAccount(hdKey: HDKey): { address: string; privateKey?: string } {
    return this.chain.getAccount(hdKey);
  }

  isAddress(address: string) {
    return this.chain.isAddress(address);
  }

  generateTokenTransferData(transferParams: {
    toAddress: string;
    amount: string;
    details: any;
  }) {
    if ('generateTokenTransferData' in this.chain) {
      return this.chain.generateTokenTransferData(transferParams);
    }
    throw new Error('Token transfer not supported at this type of chain');
  }

  parseTokenTransferData(txData: string) {
    if ('parseTokenTransferData' in this.chain) {
      return this.chain.parseTokenTransferData(txData);
    }
    throw new Error('Token transfer not supported at this type of chain');
  }

  getStandard() {
    return this.chain.getStandard();
  }

  async getFee(
    toAddress: string,
    amountHex: string,
  ): Promise<{
    maxValue?: BN;
    minValue?: BN;
    bandwidth?: BN;
    energy?: BN;
  }> {
    if (!this.account) {
      throw new Error('Use setHdKey() before sending');
    }
    if ('getFee' in this.chain) {
      const bnAmount = _hexToBn(amountHex);

      const feeParams = await this.chain.getFee(
        this.account,
        toAddress,
        bnAmount,
      );
      const bnFeeParams = Object.entries(feeParams).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: new BN(value),
        }),
        {},
      );
      return bnFeeParams;
    }
    throw new Error('not implemented getFee method');
  }

  async simpleSend(to: string, amountHex: string, fee?: Fee) {
    if (!this.account) {
      throw new Error('Use setHdKey() before sending');
    }
    const bnAmount = _hexToBn(amountHex);

    return this.chain.simpleSend(this.account, to, bnAmount, fee);
  }

  async transfer(transferParams: { transactionData: string; fee?: Fee }) {
    if (!this.account) {
      throw new Error('Use setHdKey() before sending');
    }
    if ('transfer' in this.chain) {
      return this.chain.transfer({ account: this.account, ...transferParams });
    }
    throw new Error('Transfer tokens not supported for this chain');
  }

  setHdKey(hdKey: HDKey) {
    const { address, privateKey } = this.getAccount(hdKey);
    this.account = {
      address,
      hdKey,
      privateKey,
    };
    return this.account;
  }
}
