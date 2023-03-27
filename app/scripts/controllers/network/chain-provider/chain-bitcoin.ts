import BN from 'bn.js';
import { payments, networks } from 'bitcoinjs-lib';
import BtcService from '../../../btc-service';

import ChainProvider from './interface';

export default class ChainBitcoin implements ChainProvider {
  client: any;

  constructor() {
    this.client = BtcService;
  }

  async getBalance(address: string, decimals: number) {
    const { data: accountInfo } = await this.client.getAddressInfo(address);
    const result = accountInfo.balance;
    return new BN(result, decimals);
  }

  getAccount(keyring: any) {
    const btcAccount = payments.p2pkh({
      pubkey: Buffer.from(keyring.hdWallet.pubKey),
      network: networks.testnet,
    });
    return btcAccount;
  }

  isAddress(address: string): boolean {
    return true;
  }

  simpleSend() {
    return true;
  }
}

export const chainBitcoin = new ChainBitcoin();
