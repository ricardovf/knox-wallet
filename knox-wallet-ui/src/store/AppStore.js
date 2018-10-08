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
  firstLoadComplete = false;

  @observable
  mainLeftMenuIsOpen = false;

  @observable
  page = 'accounts';

  @observable
  keyVersion = BITCOIN_TESTNET_VERSION;

  @observable
  keyVersionP2SH = BITCOIN_TESTNET_P2SH_VERSION;

  @observable
  setupIsCreatingOrRecovering = undefined;

  constructor(deviceStore) {
    this.deviceStore = deviceStore;
  }

  @action.bound
  setupBackToDecide() {
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
  async setupStartRecovering() {
    if (this.deviceStore.state === STATE_INSTALLED) {
      await this.deviceStore.ensureSetup(this.keyVersion, this.keyVersionP2SH);
    }

    this.setupIsCreatingOrRecovering = SETUP_IS_RECOVERING;
  }

  @action.bound
  changeFirstLoadToComplete() {
    this.firstLoadComplete = true;
  }

  @action.bound
  mainLeftMenuClose() {
    this.mainLeftMenuIsOpen = false;
  }

  @action.bound
  mainLeftMenuOpen() {
    this.mainLeftMenuIsOpen = true;
  }

  @action.bound
  mainLeftMenuToggle() {
    this.mainLeftMenuIsOpen = !this.mainLeftMenuIsOpen;
  }

  @action.bound
  changePage(page) {
    this.page = page;
  }
}
