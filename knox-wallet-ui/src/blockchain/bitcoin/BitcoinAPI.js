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
}
