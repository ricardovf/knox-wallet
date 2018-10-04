import { observable, computed, action, autorun, runInAction } from 'mobx';
import { __DEV__ } from '../Util';
import { asyncComputed } from 'computed-async-mobx';
import {
  BITCOIN_TESTNET_P2SH_VERSION,
  BITCOIN_TESTNET_VERSION,
  MODE_WALLET,
  STATE_INSTALLED,
} from '../device/Constants';

export const SETUP_IS_CREATING = 'creating';
export const SETUP_IS_RECOVERING = 'recovering';

export default class AppStore {
  @observable
  keyVersion = BITCOIN_TESTNET_VERSION;

  @observable
  keyVersionP2SH = BITCOIN_TESTNET_P2SH_VERSION;

  // @todo save this to localstorage
  @observable
  setupIsCreatingOrRecovering = undefined;

  constructor(deviceStore) {
    this.deviceStore = deviceStore;
  }

  @action.bound
  async setupBackToDecide() {
    this.setupIsCreatingOrRecovering = undefined;
  }

  @action.bound
  async setupStartCreating() {
    if (this.deviceStore.state === STATE_INSTALLED) {
      await this.deviceStore.ensureSetup(this.keyVersion, this.keyVersionP2SH);
    }

    this.setupIsCreatingOrRecovering = SETUP_IS_CREATING;
  }

  @action.bound
  setupStartRecovering() {
    this.setupIsCreatingOrRecovering = SETUP_IS_RECOVERING;
  }
}
