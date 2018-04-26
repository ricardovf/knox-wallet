import initialState from '../store/initialState';
import actionTypes from '../actions/types';
// import { combineReducers, createStore } from 'redux';

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.INCREMENT_COUNTER:
      return Object.assign({}, state, {
        value: state.value + action.increment,
      });
    default:
      return state;
  }
};
