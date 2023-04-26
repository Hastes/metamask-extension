import BN from 'bn.js';
import { BncClient } from '@binance-chain/javascript-sdk';
import { arrToBufArr } from 'ethereumjs-util';
import { HDKey } from 'ethereum-cryptography/hdkey';

import { ChainAccount } from './index.d';
import ChainProvider from './interface';

const HOST = {
  mainnet: 'https://dex.binance.org',
  testnet: 'https://testnet-dex.binance.org',
};

// Beacon Chain (CURRENTLY NOT USED)

export default class ChainBinance implements ChainProvider {
  client: any;

  defaultSymbol = 'tBNB';

  defaultDecimals = 18;

  defaultIconUrl =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Binance_Logo.svg/2048px-Binance_Logo.svg.png';

  constructor() {
    this.client = new BncClient(HOST.testnet);
    // this.client.chooseNetwork('mainnet');
    this.client.initChain();
  }

  async getBalance(address: string) {
    const result = await this.client.getBalance(address);
    if (typeof result !== 'number') {
      throw new Error();
    }
    return result;
  }

  getAccount(hdKey: HDKey): { address: string; privateKey: string } {
    if (!hdKey.privateKey) {
      throw new Error('Not provided private key');
    }
    const privKeyString = arrToBufArr(hdKey.privateKey).toString('hex');
    return this.client.recoverAccountFromPrivateKey(privKeyString);
  }

  isAddress(address: string): boolean {
    return true;
  }

  async simpleSend(account: ChainAccount, to: string, amount: BN) {
    return true;
  }
}

export const chainBinance = new ChainBinance();
