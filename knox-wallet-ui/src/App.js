import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { hot } from 'react-hot-loader';
// import ErrorBoundary from './ErrorBoundary';
import Incrementer from './containers/Incrementer';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome!</h1>
        </header>
        <p className="App-intro" />
        <Incrementer />
      </div>
    );
  }
}

export default hot(module)(App);
