import React, { Component } from 'react';
import logo from './media/img/logo-knox-horizontal-blue-bg.png';
import { hot } from 'react-hot-loader';
// import ErrorBoundary from './ErrorBoundary';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LayoutSetup from './components/setup/LayoutSetup';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router
        basename={
          process && process.env && process.env.NODE_ENV === 'production'
            ? '/knox-wallet-ui'
            : undefined
        }
      >
        <LayoutSetup />
      </Router>
    );
  }
}

export default hot(module)(App);
