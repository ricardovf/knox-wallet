import { action, observable } from 'mobx';
import {
  BITCOIN_P2SH_VERSION,
  BITCOIN_VERSION,
  STATE_INSTALLED,
} from '../device/Constants';

export const SETUP_IS_CREATING = 'creating';
export const SETUP_IS_RECOVERING = 'recovering';

export const COIN_SELECTION_ALL = 'all';

export default class AppStore {
  @observable
  firstLoadComplete = false;

  @observable
  mainLeftMenuIsOpen = false;

  @observable
  setupIsCreatingOrRecovering = undefined;

  @observable
  selectedCoin = COIN_SELECTION_ALL;

  @observable
  selectedAccount = null;

  @action.bound
  changeSelectedAccount(account) {
    this.selectedAccount = account;
  }

  @action.bound
  changeSelectedCoin(coin) {
    this.selectedCoin = coin;
  }

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
      await this.deviceStore.ensureSetup(BITCOIN_VERSION, BITCOIN_P2SH_VERSION);
    }

    this.setupIsCreatingOrRecovering = SETUP_IS_CREATING;
  }

  @action.bound
  async setupStartRecovering() {
    if (this.deviceStore.state === STATE_INSTALLED) {
      await this.deviceStore.ensureSetup(BITCOIN_VERSION, BITCOIN_P2SH_VERSION);
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
