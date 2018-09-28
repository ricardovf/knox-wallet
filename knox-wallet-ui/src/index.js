import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import Button from '@material-ui/core/Button';

ReactDOM.render(
  <App>
    <Button variant="contained" color="primary">
      Hello World
    </Button>
  </App>,
  document.getElementById('root')
);
// registerServiceWorker();
