import { action, computed } from 'mobx';
import { __DEV__ } from '../Util';
import { asyncComputed } from 'computed-async-mobx';
import {
  BITCOIN_TESTNET_P2SH_VERSION,
  BITCOIN_TESTNET_VERSION,
  MODE_WALLET,
  PIN_MAX_ATTEMPTS,
  STATE_INSTALLED,
  STATE_PIN_SET,
  STATE_READY,
} from '../device/Constants';

export default class DeviceStore {
  constructor(device) {
    this.device = device;
    this._refreshStateInterval = null;
  }

  _isConnectorInstalled = asyncComputed(true, 250, async () => {
    try {
      return await this.device.transport.ping();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  });

  @computed
  get isConnectorInstalled() {
    return this._isConnectorInstalled.get();
  }

  _hasDeviceConnected = asyncComputed(true, 250, async () => {
    try {
      return await this.device.transport.hasDevice();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  });

  @computed
  get hasDeviceConnected() {
    return this._hasDeviceConnected.get();
  }

  _firmware = asyncComputed(undefined, 250, async () => {
    try {
      return await this.device.getFirmwareVersion(true);
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  });

  @computed
  get firmware() {
    return this._firmware.get();
  }

  _mode = asyncComputed(MODE_WALLET, 250, async () => {
    try {
      if (this.state !== STATE_INSTALLED)
        return await this.device.getCurrentMode();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  });

  @computed
  get mode() {
    return this._mode.get();
  }

  _state = asyncComputed(STATE_READY, 250, async () => {
    try {
      return await this.device.getState();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  });

  @computed
  get state() {
    return this._state.get();
  }

  _pinVerified = asyncComputed(true, 250, async () => {
    try {
      // if (this.state === STATE_PIN_SET || this.state === STATE_READY) {
      return await this.device.isPinVerified();
      // }
    } catch (e) {
      if (__DEV__) console.log(e);
    }

    return false;
  });

  @computed
  get pinVerified() {
    return this._pinVerified.get();
  }

  _pinRemainingAttempts = asyncComputed(PIN_MAX_ATTEMPTS, 250, async () => {
    try {
      if (this.state === STATE_PIN_SET || this.state === STATE_READY) {
        return await this.device.getVerifyPinRemainingAttempts();
      }
    } catch (e) {
      if (__DEV__) console.log(e);
    }

    return false;
  });

  @computed
  get pinRemainingAttempts() {
    return this._pinRemainingAttempts.get();
  }

  _forceRefresh = () => {
    this._pinVerified.refresh();
    this._isConnectorInstalled.refresh();
    this._hasDeviceConnected.refresh();
    this._mode.refresh();
    this._state.refresh();
  };

  @action
  autoRefreshStateStart() {
    if (this._refreshStateInterval === null) {
      this._forceRefresh();
      this._refreshStateInterval = setInterval(this._forceRefresh, 5000);
    }
  }

  @action
  autoRefreshStateStop() {
    if (this._refreshStateInterval !== null) {
      clearInterval(this._refreshStateInterval);
      this._refreshStateInterval = null;
    }
  }

  @action
  async disconnectDevice() {
    try {
      await this.device.transport.disconnectDevice();
      this._forceRefresh();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  }

  @action
  async connectDevice() {
    try {
      await this.device.transport.connectDevice();
      this._forceRefresh();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  }

  @action
  async resetDevice() {
    try {
      await this.device.transport.reset();
      this._forceRefresh();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  }

  @action
  async ensureSetup(keyVersion, keyVersionP2SH) {
    try {
      await this.device.setup(MODE_WALLET, keyVersion, keyVersionP2SH);
      this._forceRefresh();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  }

  @action
  async simulatorPrepareDefaultDevice() {
    try {
      await this.device.setup(
        MODE_WALLET,
        BITCOIN_TESTNET_VERSION,
        BITCOIN_TESTNET_P2SH_VERSION
      );
      await this.device.changePin('1234');
      await this.device.verifyPin('1234');
      await this.device.prepareSeed(
        'b873212f885ccffbf4692afcb84bc2e55886de2dfa07d90f5c3c239abc31c0a6ce047e30fd8bf6a281e71389aa82d73df74c7bbfb3b06b4639a5cee775cccd3c'
      );
      this._forceRefresh();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  }

  @action
  async setPIN(pin) {
    try {
      await this.device.changePin(pin);
      await this.device.verifyPin(pin);
      this._forceRefresh();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  }

  @action.bound
  async verifyPin(pin) {
    try {
      await this.device.verifyPin(pin);
      this._forceRefresh();
      return Promise.resolve(true);
    } catch (e) {
      if (__DEV__) console.log(e);
      return Promise.reject(e);
    }
  }

  @action.bound
  async randomSeedWords() {
    try {
      let words = await this.device.randomSeedWords(true);
      return Promise.resolve(words);
    } catch (e) {
      if (__DEV__) console.log(e);
      return Promise.reject(e);
    }
  }

  @action.bound
  async prepareSeed(wordList) {
    try {
      await this.device.prepareSeed(wordList, true);
      this._forceRefresh();
      return Promise.resolve();
    } catch (e) {
      if (__DEV__) console.log(e);
      return Promise.reject(e);
    }
  }
}
