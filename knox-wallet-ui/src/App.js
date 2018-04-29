import React, { Component } from 'react';
import logo from './logo.svg';
import { hot } from 'react-hot-loader';
// import ErrorBoundary from './ErrorBoundary';
import Incrementer from './containers/Incrementer';
import Joker from './containers/Joker';
import Menu from './components/Menu';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const Home = () => 'Choose an option on the menu';
const NotFound = () => 'Page not found';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome!</h1>

            <Menu />
          </header>

          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/incrementer" component={Incrementer} />
            <Route path="/joker" component={Joker} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default hot(module)(App);
