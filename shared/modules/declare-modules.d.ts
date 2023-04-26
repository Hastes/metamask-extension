declare module 'human-standard-token-abi';

declare module 'tronweb';
declare module 'ethjs-query';
declare module 'ethjs-contract';
declare module 'bitcore-lib' {
  declare namespace Transaction {
    class UnspentOutput {
      constructor(output: any): any;
    }
  }

  declare namespace Script {
    function buildPublicKeyHashOut(address: string): string;
  }

  class Transaction {
    getFee(): number;

    from(...any): any;

    sign(privateKey: string): any;

    serialize(): string;
  }
}
declare module '@metamask/eth-hd-keyring';
