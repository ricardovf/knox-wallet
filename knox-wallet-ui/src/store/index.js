import { createStore } from 'redux';
import reducers from '../reducers';

// in the future can get the initial state from localstorage
export default createStore(reducers);
