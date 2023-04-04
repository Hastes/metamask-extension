import BN from 'bn.js';
import { HDKey } from 'ethereum-cryptography/hdkey';

export default interface ChainProvider {
  client: any;

  getBalance(address: string, decimals: number): Promise<BN>;

  getAccount(keyring: HDKey): any;

  isAddress(address: string): boolean;
}
