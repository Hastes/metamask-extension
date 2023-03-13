import TronWeb from 'tronweb';
import { BncClient } from '@binance-chain/javascript-sdk';

import { payments, networks } from 'bitcoinjs-lib';

export const makeTronAccount = (mnemonic) => {
  const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    solidityNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
  });
  return tronWeb.fromMnemonic(mnemonic);
};

export const makeBtcAccount = (walletPubKey) => {
  const btcAccount = payments.p2pkh({
    pubkey: Buffer.from(walletPubKey),
    network: networks.testnet,
  });
  return btcAccount;
};

export const makeBscAccount = async (mnemonic) => {
  const client = new BncClient('https://testnet-dex.binance.org/');
  client.chooseNetwork('mainnet');
  client.initChain();
  return client.recoverAccountFromMnemonic(mnemonic);
};
