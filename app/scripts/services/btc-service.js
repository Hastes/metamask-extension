class BtcServiceApi {
  constructor(url) {
    this.apiBaseUrl = url;
  }

  async get(url = '') {
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
    const result = await this.get(`/addrs/${address}?unspentOnly=true`);
    return result;
  }

  getNetInfo() {
    return this.get();
  }

  async initTransaction(from, to, satoshis) {
    const payloads = {
      inputs: [
        {
          addresses: [from],
        },
      ],
      outputs: [
        {
          addresses: [to],
          value: satoshis,
        },
      ],
    };
    return this.post(`/txs/new`, payloads);
  }

  /**
   * push transaction to network
   *
   * @param {string} transaction - bitcoin transaction hex-string
   * @returns {Promise} fetch response
   */
  async broadcastTransaction(transaction) {
    const result = await this.post('/txs/push', { tx: transaction });
    return result;
  }
}

export default BtcServiceApi;
