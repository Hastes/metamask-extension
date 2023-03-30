import BN from 'bn.js';
import EthQuery from 'ethjs-query';
import EthContract from 'ethjs-contract';
import HdKeyring from '@metamask/eth-hd-keyring';
import abi from 'human-standard-token-abi';
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

  async getAccount(keyring: HdKeyring) {
    // not implemented
  }

  async simpleSend(keyring: HdKeyring, to: string, amount: string) {
    // not implemented
  }

  /**
   * Check string is valid address
   *
   * @param address - account address
   */
  isAddress(address: string): boolean {
    const isAddress =
      !isBurnAddress(address) &&
      isValidHexAddress(address, {
        mixedCaseUseChecksum: true,
      });
    return isAddress;
  }
}
