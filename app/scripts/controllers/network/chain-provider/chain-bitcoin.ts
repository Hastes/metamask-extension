import BN from 'bn.js';
import { address, payments, networks } from 'bitcoinjs-lib';
import { arrToBufArr } from 'ethereumjs-util';
import { HDKey } from 'ethereum-cryptography/hdkey';
import BtcService from '../../../btc-service';

import ChainProvider from './interface';

export default class ChainBitcoin implements ChainProvider {
  client: any;

  defaultSymbol = 'BTC';

  defaultDecimals = 9;

  defaultIconUrl =
    'https://www.citypng.com/public/uploads/preview/-51614559661pdiz2gx0zn.png';

  constructor() {
    this.client = BtcService;
  }

  async getBalance(addrs: string, decimals: number) {
    const { data } = await this.client.getBalance(addrs);
    const result = data.balance;
    return new BN(result, decimals);
  }

  getAccount(hdKey: HDKey) {
    if (!hdKey.publicKey) {
      throw new Error('No public key');
    }
    const btcAccount = payments.p2pkh({
      pubkey: arrToBufArr(hdKey.publicKey),
      network: networks.testnet,
    });
    return btcAccount;
  }

  isAddress(string: string): boolean {
    try {
      address.toOutputScript(string, networks.testnet);
      return true;
    } catch (e) {
      return false;
    }
  }

  async simpleSend(keyring: any, toAddress: string, amount: number) {
    const tx = new bitcoin.TransactionBuilder(networks.testnet);
    const unspent = await this.client.getUnspent(keyring.hdWallet.address);
    const totalValue = unspent.reduce((acc, { value }) => acc + value, 0);
    const fee = 10000; // 10,000 satoshis
    const change = totalValue - amount - fee;
    if (change < 0) {
      throw new Error('Insufficient funds');
    }
    unspent.forEach(({ txid, vout }) => {
      tx.addInput(txid, vout);
    });
    tx.addOutput(toAddress, amount);
    if (change > 0) {
      tx.addOutput(keyring.hdWallet.address, change);
    }
    const btcAccount = this.getAccount(keyring);
    tx.sign(0, btcAccount.keyPair);
    const txHex = tx.build().toHex();
    const { data } = await this.client.broadcastTransaction(txHex);
    return data.txid;
  }
}

export const chainBitcoin = new ChainBitcoin();
