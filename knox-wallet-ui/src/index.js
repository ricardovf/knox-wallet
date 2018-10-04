import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import DeviceStore from './store/DeviceStore';
import SecureDevice from './device/SecureDevice';
import TransportHTTP from './device/TransportHTTP';
import AppStore from './store/AppStore';

const secureDevice = new SecureDevice(new TransportHTTP(false));
const deviceStore = new DeviceStore(secureDevice);
const appStore = new AppStore(deviceStore);

configure({ enforceActions: 'observed' });

const stores = { deviceStore, appStore };

ReactDOM.render(
  <Provider {...stores}>
    <App />
  </Provider>,
  document.getElementById('root')
);
// registerServiceWorker();
