import BN from 'bn.js';
import EthQuery from 'ethjs-query';
import EthContract from 'ethjs-contract';
import { publicToAddress, arrToBufArr, addHexPrefix } from 'ethereumjs-util';
import abi from 'human-standard-token-abi';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { getProvider } from '../provider-api-tests/helpers';
import {
  isBurnAddress,
  isValidHexAddress,
} from '../../../../../shared/modules/hexstring-utils';
import ChainProvider from './interface';

import { ProviderConfig } from './index.d';

export default class ChainEth implements ChainProvider {
  client: typeof EthQuery;

  contract?: typeof EthContract = null;

  defaultSymbol = 'ETH';

  defaultDecimals = 18;

  defaultIconUrl = '';

  constructor(provider: ProviderConfig) {
    const buildedProvider = getProvider({
      providerType: 'custom',
      customRpcUrl: provider.rpcUrl,
      customChainId: provider.chainId,
    });
    this.client = new EthQuery(buildedProvider);

    if (provider.contract) {
      const contract = new EthContract(this.client);
      this.contract = contract(abi).at(provider.contract);
    }
  }

  async getBalance(address: string, decimals: number) {
    let result;
    if (this.contract) {
      [result] = await this.contract.balanceOf(address);
    } else {
      result = await this.client.getBalance(address);
    }
    return new BN(result, decimals);
  }

  getAccount(hdKey: HDKey) {
    if (!hdKey.publicKey) {
      throw new Error('No public key');
    }
    const pubKey = arrToBufArr(hdKey.publicKey);
    const address = publicToAddress(pubKey, true).toString('hex');
    return { address: addHexPrefix(address) };
  }

  async simpleSend(hdKey: HDKey, to: string, amount: string) {
    // not implemented
  }

  /**
   * Check string is valid address
   *
   * @param address - account address
   */
  isAddress(address: string): boolean {
    const isAddress =
      !isBurnAddress(address);
      // isValidHexAddress(address, {
      //   mixedCaseUseChecksum: true,
      // });
    return isAddress;
  }
}
