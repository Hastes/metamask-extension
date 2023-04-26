import BN from 'bn.js';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { ChainAccount, Fee } from '.';

export default interface ChainProvider {
  client: any;

  getBalance(address: string): Promise<string>;

  getAccount(hdKey: HDKey): any;

  /**
   * Check string is valid address
   *
   * @param address - input account address
   */
  isAddress(address: string): boolean;

  /**
   * Simple send from one address to another
   *
   * @param account
   * @param toAddress - recipient address
   * @param amount - BigNumber value
   * @param feeAmount - BigNumber value of fee
   * @returns
   */
  simpleSend(
    account: ChainAccount,
    toAddress: string,
    amount: BN,
    fee?: Fee,
  ): Promise<any>;
}
