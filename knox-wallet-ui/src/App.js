import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { hot } from 'react-hot-loader';
import SimpleButton from './components/SimpleButton';
// import ErrorBoundary from './ErrorBoundary';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counter: 1,
    };
  }

  increment = () => {
    this.setState({ counter: this.state.counter + 1 });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">{this.state.counter}</h1>
        </header>
        <p className="App-intro">
          <button onClick={this.increment}>Increment</button>
        </p>
        <p>
          <SimpleButton name={'Dudee'} bg={'yellow'} />
        </p>
      </div>
    );
  }
}

export default hot(module)(App);
