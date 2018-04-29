export const actions = {
  INCREMENT_COUNTER: 'INCREMENT_COUNTER',
  FETCH_JOKE: 'FETCH_JOKE',
};

export default actions;

export const incrementCounter = increment => {
  return {
    type: actions.INCREMENT_COUNTER,
    increment,
  };
};

export const fetchJoke = increment => {
  return {
    type: actions.FETCH_JOKE,
    increment,
  };
};
