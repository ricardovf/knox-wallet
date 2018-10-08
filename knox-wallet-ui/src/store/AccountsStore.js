import { observable, computed, action, autorun, runInAction } from 'mobx';
import { __DEV__ } from '../Util';
import { asyncComputed } from 'computed-async-mobx';
import {
  BITCOIN_TESTNET_P2SH_VERSION,
  BITCOIN_TESTNET_VERSION,
  MODE_WALLET,
  STATE_INSTALLED,
} from '../device/Constants';

export default class AccountsStore {
  @observable
  coins = { BTC: 'Bitcoin' };

  @observable
  selectedCoin = 'BTC';

  constructor(appStore) {
    this.appStore = appStore;
    this.deviceStore = appStore.deviceStore;
  }

  @action.bound
  changeSelectedCoin(coin) {
    // @todo check if coin is valid
    this.selectedCoin = coin;
  }
}
