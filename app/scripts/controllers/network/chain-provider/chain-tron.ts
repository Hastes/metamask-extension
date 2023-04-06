import BN from 'bn.js';
import TronWeb from 'tronweb';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { arrToBufArr } from 'ethereumjs-util';

import ChainProvider from './interface';

const TRON_HOST = {
  mainnet: 'https://api.trongrid.io',
  testnet: 'https://nile.trongrid.io',
};

export default class ChainTron implements ChainProvider {
  client: any;

  defaultSymbol = 'tTRX';

  defaultDecimals = 6;

  defaultIconUrl = 'https://cryptologos.cc/logos/tron-trx-logo.png';

  constructor() {
    this.client = new TronWeb({
      fullHost: TRON_HOST.testnet,
    });
  }

  async getBalance(address: string, decimals: number) {
    const result = await this.client.trx.getBalance(address);
    return new BN(result, decimals);
  }

  getAccount(hdKey: HDKey): { address: string; privateKey: string } {
    if (!hdKey.privateKey) {
      throw new Error('Not provided private key');
    }
    const privKeyString = arrToBufArr(hdKey.privateKey).toString('hex');
    const address = this.client.address.fromPrivateKey(privKeyString);
    return {
      address,
      privateKey: privKeyString,
    };
  }

  simpleSend(hdKey: HDKey, to: string, amount: string) {
    const account = this.getAccount(hdKey);
    const pk = account.privateKey;
    return this.client.trx.sendTransaction(to, parseInt(amount, 16), pk);
  }

  /**
   * Check string is valid address
   *
   * @param address - account address
   */
  isAddress(address: string): boolean {
    return TronWeb.isAddress(address);
  }

  getFee() {
    return this.client.trx.getChainParameters();
  }
}

export const chainTron = new ChainTron();
