import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import { default as store } from './store';
import { AppContainer } from 'react-hot-loader';
import createBrowserHistory from 'history/createBrowserHistory';
import { syncHistoryWithStore } from 'mobx-react-router';
import { Router, withRouter } from 'react-router';
import { __DEV__ } from './Util';

const browserHistory = createBrowserHistory();

configure({ enforceActions: 'observed' });

window.stores = window.stores || store;

const history = syncHistoryWithStore(browserHistory, window.stores.routing);

const renderApp = Component => {
  ReactDOM.render(
    <AppContainer>
      <Provider {...window.stores}>
        <Router
          basename={__DEV__ ? undefined : '/knox-wallet-ui'}
          history={history}
        >
          <Component />
        </Router>
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  );
};
// registerServiceWorker();

renderApp(withRouter(App));

// hot reload config
if (module.hot) {
  module.hot.accept(['./App', './store'], () => {
    const newApp = require('./App').default;
    // store.deviceStore._forceRefresh();
    renderApp(withRouter(newApp));
  });
}
