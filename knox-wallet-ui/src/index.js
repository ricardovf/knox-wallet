import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import Button from '@material-ui/core/Button';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import deviceStore from './store/deviceStore';

configure({ enforceActions: 'observed' });

const stores = { deviceStore };

ReactDOM.render(
  <Provider {...stores}>
    <App />
  </Provider>,
  document.getElementById('root')
);
// registerServiceWorker();
