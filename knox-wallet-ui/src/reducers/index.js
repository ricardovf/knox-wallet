import { combineReducers } from 'redux';
import joker from './joker';
import incrementer from './incrementer';

export default combineReducers({
  joker,
  incrementer,
});
