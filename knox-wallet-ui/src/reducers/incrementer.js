import actions from '../actions';

export default (state = { value: 0 }, action) => {
  switch (action.type) {
    case actions.INCREMENT_COUNTER:
      return {
        ...state,
        value: state.value + action.increment,
      };
    default:
      return state;
  }
};
