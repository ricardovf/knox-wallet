import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import { default as store } from './store';
import { AppContainer } from 'react-hot-loader';

configure({ enforceActions: 'observed' });

window.stores = window.stores || store;

const renderApp = Component => {
  ReactDOM.render(
    <AppContainer>
      <Provider {...window.stores}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  );
};
// registerServiceWorker();

renderApp(App);

// hot reload config
if (module.hot) {
  module.hot.accept(['./App', './store'], () => {
    const newApp = require('./App').default;
    // store.deviceStore._forceRefresh();
    renderApp(newApp);
  });
}
