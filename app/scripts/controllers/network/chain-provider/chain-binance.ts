import BN from 'bn.js';
import HdKeyring from '@metamask/eth-hd-keyring';
import { BncClient } from '@binance-chain/javascript-sdk';

import ChainProvider from './interface';

const HOST = {
  mainnet: 'https://dex.binance.org',
  testnet: 'https://testnet-dex.binance.org',
};

export default class ChainBinance implements ChainProvider {
  client: any;

  constructor() {
    this.client = new BncClient(HOST.testnet);
    // this.client.chooseNetwork('mainnet');
    this.client.initChain();
  }

  async getBalance(address: string, decimals: number) {
    const result = await this.client.getBalance(address);
    if (typeof result !== 'number') {
      throw new Error();
    }
    return new BN(result, decimals);
  }

  async getAccount(
    keyring: typeof HdKeyring,
  ): Promise<{ address: string; privateKey: string }> {
    const mnemonic = await keyring
      .serialize()
      .then((v: any) => Buffer.from(v.mnemonic).toString());
    return this.client.recoverAccountFromMnemonic(mnemonic);
  }

  isAddress(address: string): boolean {
    return true;
  }

  simpleSend() {
    return true;
  }
}

export const chainBinance = new ChainBinance();
