import { observable, action, autorun, runInAction, computed } from 'mobx';
import SecureDevice from '../device/SecureDevice';
import TransportHTTP from '../device/TransportHTTP';
import { __DEV__ } from '../Util';
import { asyncComputed } from 'computed-async-mobx';
import {
  BITCOIN_TESTNET_P2SH_VERSION,
  BITCOIN_TESTNET_VERSION,
  MODE_WALLET,
  STATE_INSTALLED,
} from '../device/Constants';

export default class DeviceStore {
  constructor(device) {
    this.device = device;
    this._isConnectorInstalled.refresh();
    this._hasDeviceConnected.refresh();
  }

  _isConnectorInstalled = asyncComputed(false, 100, async () => {
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

  _hasDeviceConnected = asyncComputed(false, 100, async () => {
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

  _firmware = asyncComputed(undefined, 100, async () => {
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

  _mode = asyncComputed(undefined, 100, async () => {
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

  _state = asyncComputed(STATE_INSTALLED, 100, async () => {
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

  @action
  autoRefreshStateStart() {
    if (!this._refreshStateInterval) {
      this._refreshStateInterval = setInterval(() => {
        this._isConnectorInstalled.refresh();
        this._hasDeviceConnected.refresh();
        this._firmware.refresh();
        this._mode.refresh();
        this._state.refresh();
      }, 1000);
    }
  }

  @action
  autoRefreshStateStop() {
    if (this._refreshStateInterval) {
      clearInterval(this._refreshStateInterval);
    }
  }

  @action
  async disconnectDevice() {
    try {
      await this.device.transport.disconnectDevice();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  }

  @action
  async connectDevice() {
    try {
      await this.device.transport.connectDevice();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  }

  @action
  async resetDevice() {
    try {
      await this.device.transport.reset();
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  }

  @action
  async ensureSetup(keyVersion, keyVersionP2SH) {
    try {
      await this.device.setup(MODE_WALLET, keyVersion, keyVersionP2SH);
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  }
}
