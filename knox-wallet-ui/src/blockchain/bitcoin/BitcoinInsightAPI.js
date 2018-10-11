import BitcoinAPI from './BitcoinAPI';

export default class BitcoinInsightAPI extends BitcoinAPI {
  constructor(endpoint) {
    super(endpoint);
  }

  addressInfo(address) {
    return this._addressProperties(address, '');
  }

  addressBalance(address) {
    return this._addressProperties(address, 'balance');
  }

  /**
   * Returns the satoshi amount received in the address
   * @param address
   */
  addressTotalReceived(address) {
    return this._addressProperties(address, 'totalReceived');
  }

  addressTotalSent(address) {
    return this._addressProperties(address, 'totalSent');
  }

  addressUnconfirmedBalance(address) {
    return this._addressProperties(address, 'unconfirmedBalance');
  }

  _addressProperties(address, property) {
    return new Promise((resolve, reject) => {
      if (!this.endpoint) return reject('Invalid endpoint');
      if (!address) return reject('Invalid address');
      if (!property) property = '';

      fetch(`${this.endpoint}/addr/${address}/${property}`)
        .then(response => response.json())
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject('Error requesting Bitcoin API: ' + err);
        });
    });
  }
}
