import BN from 'bn.js';
import { MetaMaskKeyring } from '@keystonehq/metamask-airgapped-keyring';

export default interface ChainProvider {
  client: any;

  getBalance(address: string, decimals: number): Promise<BN>;

  getAccount(keyring: MetaMaskKeyring): any;

  isAddress(address: string): boolean;
}
