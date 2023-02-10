const BTC_TESTNET_BLOCKCHAIN = 'https://api.blockchair.com/bitcoin/testnet/';

// const fakeAddressResponse = {
//   mnVC8THGotp5J3JuStXr6BZo3Uzc59L9km: {
//     address: {
//       type: 'pubkeyhash',
//       script_hex: '76a9144c7398d565af26b5a253204e83564ac9e7d3c2aa88ac',
//       balance: 1962078,
//       balance_usd: 0,
//       received: 1962078,
//       received_usd: 0,
//       spent: 0,
//       spent_usd: 0,
//       output_count: 2,
//       unspent_output_count: 2,
//       first_seen_receiving: '2023-02-06 14:39:32',
//       last_seen_receiving: '2023-02-06 15:19:07',
//       first_seen_spending: null,
//       last_seen_spending: null,
//       scripthash_type: null,
//       transaction_count: 2,
//     },
//     transactions: [
//       '7100a52d4d3cdbd93ebbbccad5524371c04a98e91b9a8c50d692ddeaf9d02eea',
//       '1f8fddc96c0021a11e2ce236b875f729fab423c5555c17628a797078f1c3a995',
//     ],
//     utxo: [
//       {
//         block_id: 2419109,
//         transaction_hash:
//           '7100a52d4d3cdbd93ebbbccad5524371c04a98e91b9a8c50d692ddeaf9d02eea',
//         index: 0,
//         value: 13590,
//       },
//       {
//         block_id: 2419106,
//         transaction_hash:
//           '1f8fddc96c0021a11e2ce236b875f729fab423c5555c17628a797078f1c3a995',
//         index: 1,
//         value: 1948488,
//       },
//     ],
//   },
// };

class BtcServiceApi {
  constructor(url) {
    this.apiBaseUrl = url;
  }

  async get(url) {
    const resp = await fetch(`${this.apiBaseUrl}${url}`);
    const result = await resp.json();
    return result;
  }

  async post(url, data) {
    const resp = await fetch(`${this.apiBaseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await resp.json();
    return result;
  }

  /**
   * get balance, utxo and etc...
   *
   * @param {string} address - account address
   * @returns {Promise} fetch response
   */
  async getAddressInfo(address) {
    // return Promise.resolve(fakeAddressResponse);
    const result = await this.get(`dashboards/address/${address}`);
    return result;
  }

  /**
   * push transaction to network
   *
   * @param {string} transaction - bitcoin transaction hex-string
   * @returns {Promise} fetch response
   */
  async broadcastTransaction(transaction) {
    const result = await this.post('push/transaction', { data: transaction });
    return result;
  }
}

const BtcService = new BtcServiceApi(BTC_TESTNET_BLOCKCHAIN);

export default BtcService;
