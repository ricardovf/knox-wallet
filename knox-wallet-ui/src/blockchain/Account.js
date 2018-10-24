import { Big } from 'big.js';
import { satoshiToBTC, satoshiToUSD } from './Converter';
import { action, observable } from 'mobx';

export default class Account {
  coin = null;
  index = null;
  name = '';
  purpose = 0;

  @observable
  addresses = new Map();

  @observable
  addressesInternal = new Map();

  @observable
  transactions = new Map();

  @observable
  _balance = '0';

  @observable
  _balanceBTC = '0';

  @observable
  _balanceUSD = '0';

  get balance() {
    return this._balance;
  }

  get balanceBTC() {
    return this._balanceBTC;
  }

  get balanceUSD() {
    return this._balanceUSD;
  }

  @action.bound
  updateBalance() {
    let balance = new Big(0);
    for (let addressIndex of [...this.addresses.keys()]) {
      let address = this.addresses.get(addressIndex);
      balance = balance.plus(address.balance);
      balance = balance.plus(address.unconfirmedBalance);
    }

    for (let addressIndex of [...this.addressesInternal.keys()]) {
      let address = this.addressesInternal.get(addressIndex);
      balance = balance.plus(address.balance);
      balance = balance.plus(address.unconfirmedBalance);
    }

    this._balance = balance.toString();
    this._balanceBTC = satoshiToBTC(balance);
    this._balanceUSD = satoshiToUSD(balance);
  }

  getIdentifier() {
    return `${this.purpose}-${this.coin.key || ''}-${this.index}`;
  }
}
