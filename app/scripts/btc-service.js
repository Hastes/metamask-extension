const BTC_TESTNET_BLOCKCHAIN = 'https://testnet.blockcypher.com/v1/btc/test3/';

class BtcServiceApi {
  constructor(url) {
    this.apiBaseUrl = url;
  }

  static async getUnspent(address) {
    const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/unspent`;
    const response = await fetch(url);
    const data = await response.json();
    return data.map(({ tx_hash, tx_output_n, value }) => ({
      txid: tx_hash,
      vout: tx_output_n,
      value: value,
    }));
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
    const result = await this.get(`addrs/${address}`);
    return result;
  }

  /**
   * get balance
   *
   * @param {string} address - account address
   * @returns {Promise} fetch response
   */
  async getBalance(address) {
    const result = await this.get(`addrs/${address}/balance`);
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
