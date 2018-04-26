import actionTypes from './types';

export const incrementCounter = increment => {
  return {
    type: actionTypes.INCREMENT_COUNTER,
    increment,
  };
};
