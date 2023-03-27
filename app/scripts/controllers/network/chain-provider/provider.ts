import HdKeyring from '@metamask/eth-hd-keyring';

import { NETWORK_TYPES } from '../../../../../shared/constants/network';

import { ProviderConfig } from './index.d';
import ChainBinance from './chain-binance';
import ChainTron from './chain-tron';
import ChainBitcoin from './chain-bitcoin';
import ChainEth from './chain-eth';

export default class Provider {
  readonly chain: ChainBinance | ChainBitcoin | ChainTron | ChainEth | null =
    null;

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

    const ChainClass = CHAIN_BY_NETWORK[provider.type];

    if (ChainClass) {
      this.chain = new ChainClass(provider);
    }
  }

  getBalance(address: string, decimals: number) {
    if (!this.chain) {
      throw new Error('Not implemented network type');
    }
    return this.chain.getBalance(address, decimals);
  }

  getAccount(keyring: typeof HdKeyring) {
    if (!this.chain) {
      throw new Error('Not implemented network type');
    }
    this.chain.getAccount(keyring);
  }

  isAddress(address: string) {
    if (!this.chain) {
      throw new Error('Not implemented network type');
    }
    this.chain.isAddress(address);
  }

  async simpleSend(keyring: typeof HdKeyring, to: string, amount: string) {
    if (!this.chain) {
      throw new Error('Not implemented network type');
    }

    this.chain.simpleSend(keyring, to, amount);
  }
}
