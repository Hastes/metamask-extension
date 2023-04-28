import BN from 'bn.js';
import TronWeb from 'tronweb';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { arrToBufArr } from 'ethereumjs-util';

import { generateTRC20TransferData } from '../../../../../ui/pages/send/send.utils';
import { calcTokenAmount } from '../../../../../shared/lib/transactions-controller-utils';
import ChainProvider from './interface';
import { ChainAccount, Fee, ProviderConfig } from '.';

const TRON_HOST = {
  mainnet: 'https://api.trongrid.io',
  testnetNile: 'https://nile.trongrid.io',
  testnetShasta: 'https://api.shasta.trongrid.io',
};

const ENERGY_MAX_ESTIMATE = 65000;
const BANDWIDTH_RATE = 1000; // unit price of bandwidth is 1000sun
const ENERGY_RATE = 420; // unit price of energy is 420sun

export default class ChainTron implements ChainProvider {
  client: any;

  provider: ProviderConfig;

  contract: string | null = null;

  abi: any = null;

  defaultSymbol = 'TRX';

  defaultDecimals = 6;

  defaultIconUrl = 'https://cryptologos.cc/logos/tron-trx-logo.png';

  constructor(provider: ProviderConfig, isTestnet = false) {
    this.client = new TronWeb({
      fullHost: isTestnet ? TRON_HOST.testnetShasta : TRON_HOST.mainnet,
    });
    this.provider = provider;
    if (provider.contract) {
      this.contract = provider.contract;
    }
  }

  get decimals(): number {
    return this.provider.decimals || this.defaultDecimals;
  }

  async initContract() {
    if (!this.abi) {
      this.abi = await this.client.contract().at(this.contract);
    }
  }

  async getBalance(address: string): Promise<string> {
    if (this.contract) {
      this.client.setAddress(address);
      await this.initContract();
      const balance = await this.abi.balanceOf(address).call();
      return balance.toString();
    }
    return this.client.trx.getBalance(address);
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

  async simpleSend(account: ChainAccount, to: string, amount: BN) {
    const signedtxn = await this._buildTransaction(
      account,
      to,
      amount.toString(),
    );
    return this.client.trx.sendRawTransaction(signedtxn);
  }

  async transfer({
    account,
    transactionData,
    fee,
  }: {
    account: ChainAccount;
    transactionData: string;
    fee?: Fee;
  }) {
    this.client.setAddress(account.address);
    this.client.setPrivateKey(account.privateKey);
    await this.initContract();

    const { toAddress, tokenAmountWithoutDecimals } =
      this.parseTokenTransferData(transactionData);
    const res = await this.abi
      .transfer(toAddress, tokenAmountWithoutDecimals.toString())
      .send({
        feeLimit: parseInt(String(fee?.maxValue), 16),
      });
    return res;
  }

  generateTokenTransferData(transferParams: any) {
    return generateTRC20TransferData(transferParams);
  }

  parseTokenTransferData(transactionData: string) {
    const transfer = ['address', 'uint256'];
    const [toAddress, amount] = this.client.utils.abi.decodeParams(
      transfer,
      transactionData,
    );

    return {
      toAddress,
      tokenAmountWithoutDecimals: amount,
      tokenAmount: calcTokenAmount(amount, this.decimals),
      tokenId: null,
    };
  }

  getStandard(): string | null {
    // TODO: improve it. Can be TRC10
    if (this.contract) {
      return 'TRC20';
    }
    return null;
  }

  isAddress(address: string): boolean {
    return TronWeb.isAddress(address);
  }

  async getFee(
    account: ChainAccount,
    toAddress: string,
    value: BN,
  ): Promise<Fee> {
    let feeCs = 0;
    let feeTrx = 0;
    let energyEstimate = 0;
    let energyBalance;

    const [accountResources, bandwidthBalance] = await Promise.all([
      this.client.trx.getAccountResources(account.address),
      this.client.trx.getBandwidth(account.address),
    ]);

    const amount = value.toString();

    const transferData = this.generateTokenTransferData({
      toAddress,
      amount,
    });
    if (this.contract) {
      energyEstimate = ENERGY_MAX_ESTIMATE;

      const result = await this.client.eventServer.request(
        '/wallet/estimateenergy',
        {
          owner_address: account.address,
          contract_address: this.contract,
          function_selector: 'transfer(address,uint256)',
          parameter: transferData,
          visible: true,
        },
        'POST',
      );
      console.log(result);
      if (result?.energy_required) {
        energyEstimate = result.energy_required;
      }

      energyBalance =
        accountResources.EnergyLimit - accountResources.EnergyUsed || 0;

      feeCs =
        energyBalance - energyEstimate <= 0 ? energyEstimate * ENERGY_RATE : 0;
    } else {
      const tx = await this._buildTransaction(account, toAddress, amount);
      const txLen = Buffer.from(tx.raw_data_hex, 'hex').length;

      feeTrx = bandwidthBalance <= 0 ? txLen * BANDWIDTH_RATE : 0;
    }

    return {
      maxValue: feeTrx + feeCs,
      bandwidth: bandwidthBalance,
      energy: energyBalance,
    };
  }

  async _buildTransaction(
    account: ChainAccount,
    toAddress: string,
    amount: string,
  ) {
    const tradeobj = await this.client.transactionBuilder.sendTrx(
      toAddress,
      amount,
      account.address,
    );
    const signedtxn = await this.client.trx.sign(tradeobj, account.privateKey);
    return signedtxn;
  }
}
