import BN from 'bn.js';
import TronWeb from 'tronweb';
import HdKeyring from '@metamask/eth-hd-keyring';
import { unpadHexString } from 'ethereumjs-util';

import ChainProvider from './interface';

const TRON_HOST = {
  mainnet: 'https://api.trongrid.io',
  testnet: 'https://nile.trongrid.io',
};

export default class ChainTron implements ChainProvider {
  client: any;

  constructor() {
    this.client = new TronWeb({
      fullHost: TRON_HOST.testnet,
    });
  }

  async getBalance(address: string, decimals: number) {
    const result = await this.client.trx.getBalance(address);
    return new BN(result, decimals);
  }

  async getAccount(
    keyring: typeof HdKeyring,
  ): Promise<{ address: string; publicKey: string; privateKey: string }> {
    const mnemonic = await keyring
      .serialize()
      .then((v: any) => Buffer.from(v.mnemonic).toString());
    const tronAccount = TronWeb.fromMnemonic(mnemonic);
    return tronAccount;
  }

  async simpleSend(keyring: typeof HdKeyring, to: string, amount: string) {
    const account = await this.getAccount(keyring);
    const pk = unpadHexString(account.privateKey);
    this.client.trx.sendTransaction(to, parseInt(amount, 16), pk);
  }

  /**
   * Check string is valid address
   *
   * @param address - account address
   */
  isAddress(address: string): boolean {
    return TronWeb.isAddress(address);
  }
}

export const chainTron = new ChainTron();
