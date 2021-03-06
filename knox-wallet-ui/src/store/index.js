import SecureDevice from '../device/SecureDevice';
import TransportHTTP from '../device/TransportHTTP';
import DeviceStore from './DeviceStore';
import AppStore from './AppStore';
import AccountsStore from './AccountsStore';
import { RouterStore } from 'mobx-react-router';

const routing = new RouterStore();

const secureDevice = new SecureDevice(new TransportHTTP(false));
const deviceStore = new DeviceStore(secureDevice);
const appStore = new AppStore(deviceStore);
const accountsStore = new AccountsStore(appStore);

export default { deviceStore, appStore, accountsStore, routing };
