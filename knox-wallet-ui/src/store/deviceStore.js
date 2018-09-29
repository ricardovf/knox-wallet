import { observable, action, autorun, runInAction } from 'mobx';

class DeviceStore {
  @observable
  firmwareVersion;

  constructor() {
    // autorun(() => this.fetchFirmwareVersion());
    this.fetchFirmwareVersion();
  }

  @action
  fetchFirmwareVersion() {
    fetch('http://127.0.0.1:28281/call', {
      method: 'POST',
      body: 'E0C4000000',
    })
      .then(response => response.text())
      .then(data => {
        runInAction(() => {
          this.firmwareVersion = data;
        });
      })
      .catch(err => {
        console.log('Fetch error: ', err);
      });
  }

  @action
  updateVersion() {
    this.firmwareVersion = '2.2.2';
  }
}

const deviceStore = new DeviceStore();
export default deviceStore;

autorun(() => {
  console.log(deviceStore.firmwareVersion);
});
