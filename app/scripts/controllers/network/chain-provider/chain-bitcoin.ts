import BN from 'bn.js';
import { address, payments, networks } from 'bitcoinjs-lib';
import bitcore from 'bitcore-lib';
import { arrToBufArr } from 'ethereumjs-util';
import { HDKey } from 'ethereum-cryptography/hdkey';
import BtcService from '../../../services/btc-service';

import { ChainAccount, Fee, ProviderConfig } from './index.d';
import ChainProvider from './interface';

const DEFAULT_FEE_PER_BYTE = 22;

const BTC_API_SERVICE = {
  mainnet: 'https://api.blockcypher.com/v1/btc/main',
  testnet: 'https://api.blockcypher.com/v1/btc/test3',
};

export default class ChainBitcoin implements ChainProvider {
  client: any;

  defaultSymbol = 'BTC';

  defaultDecimals = 9;

  defaultIconUrl =
    'https://www.citypng.com/public/uploads/preview/-51614559661pdiz2gx0zn.png';

  constructor(_provider: ProviderConfig, isTestnet = false) {
    this.client = new BtcService(
      isTestnet ? BTC_API_SERVICE.testnet : BTC_API_SERVICE.mainnet,
    );
  }

  async getBalance(_addrs: string) {
    // const resp = await this.client.getAddressInfo(addrs);
    // const result = resp.balance;
    const result = 9e8;
    return result;
  }

  getAccount(hdKey: HDKey): { address: string; privateKey: string } {
    if (!hdKey.publicKey) {
      throw new Error('No public key');
    }
    const btcAccount = payments.p2pkh({
      pubkey: arrToBufArr(hdKey.publicKey),
      network: networks.testnet,
    });
    if (!btcAccount.address || !hdKey.privateKey) {
      throw new Error('Incorrect hdKey');
    }
    return {
      address: btcAccount.address,
      privateKey: Buffer.from(hdKey.privateKey).toString('hex'),
    };
  }

  isAddress(string: string): boolean {
    try {
      address.toOutputScript(string, networks.testnet);
      return true;
    } catch (e) {
      return false;
    }
  }

  getStandard(): string | null {
    return 'BIP44';
  }

  async getFee(
    account: ChainAccount,
    toAddress: string,
    amount: BN,
  ): Promise<Fee> {
    const result = await this.client.getNetInfo();
    const feeParams = {
      highFeePerByte: result.high_fee_per_kb / 1024,
      mediumFeePerByte: result.medium_fee_per_kb / 1024,
      lowFeePerByte: result.low_fee_per_kb / 1024,
    };
    const transcation = await this._buildTransaction(
      account,
      toAddress,
      amount,
      feeParams.mediumFeePerByte,
    );
    return {
      minValue: transcation.getFee(),
      ...feeParams,
    };
  }

  async _buildTransaction(
    account: ChainAccount,
    toAddress: string,
    amount: BN,
    feePerByte = DEFAULT_FEE_PER_BYTE,
  ): Promise<bitcore.Transaction> {
    const resp = await this.client.getAddressInfo(account.address);
    const value = amount.toNumber();

    const unspentTxs = resp.txrefs;

    const utxos = unspentTxs.map((utxo: any) => {
      return new bitcore.Transaction.UnspentOutput({
        txId: utxo.tx_hash,
        outputIndex: utxo.tx_output_n,
        address: account.address,
        script: bitcore.Script.buildPublicKeyHashOut(account.address),
        satoshis: utxo.value,
      });
    });

    const transaction = new bitcore.Transaction();

    return transaction
      .from(utxos)
      .to(toAddress, value)
      .change(account.address)
      .feePerByte(feePerByte)
      .fee(transaction.getFee());
  }

  async simpleSend(
    account: ChainAccount,
    toAddress: string,
    amount: BN,
    fee?: Fee,
  ) {
    const feePerByte = fee?.mediumFeePerByte
      ? parseInt(fee.mediumFeePerByte as string, 16)
      : undefined;
    const transcation = await this._buildTransaction(
      account,
      toAddress,
      amount,
      feePerByte,
    );

    if (!account.privateKey) {
      throw new Error('Private key not provided');
    }

    transcation.sign(account.privateKey);
    const transactionString = transcation.serialize();

    await this.client.broadcastTransaction(transactionString);
    return transactionString;
  }
}
