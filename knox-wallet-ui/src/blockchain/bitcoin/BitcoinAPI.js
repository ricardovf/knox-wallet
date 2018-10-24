export default class BitcoinAPI {
  endpoint = null;

  constructor(endpoint) {
    this.setEndPoint(endpoint);
  }

  setEndPoint(endpoint) {
    this.endpoint = endpoint;
  }

  getEndPoint() {
    return this.endpoint;
  }

  async currentUSDRate() {
    return new Promise((resolve, reject) => {
      return fetch('http://api.coindesk.com/v1/bpi/currentprice/USD.json')
        .then(response => response.json())
        .then(data => {
          resolve(data.bpi.USD.rate_float);
        })
        .catch(err => {
          reject('Error requesting Bitcoin API: ' + err);
        });
    });
  }
}
