import * as R from 'ramda';
import { Big } from 'big.js';
import { satoshiToBTC, satoshiToUSD } from './Converter';
import { observable, computed, action, autorun, runInAction } from 'mobx';

export default class Account {
  coin = null;
  index = null;
  name = '';
  purpose = null;
  addresses = new Map();
  addressesInternal = new Map();

  @observable
  _balance = '0';

  @observable
  _balanceUSD = '0';

  get balance() {
    return this._balance;
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
    }

    for (let addressIndex of [...this.addressesInternal.keys()]) {
      let address = this.addressesInternal.get(addressIndex);
      balance = balance.plus(address.balance);
    }

    this._balance = satoshiToBTC(balance);
    this._balanceUSD = satoshiToUSD(balance);
  }

  getIdentifier() {
    return `${this.purpose}-${this.coin.key || ''}-${this.index}`;
  }
}
