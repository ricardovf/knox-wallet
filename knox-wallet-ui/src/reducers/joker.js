import actions from '../actions';

export default (state = { joke: null }, action) => {
  switch (action.type) {
    case actions.FETCH_JOKE:
      return {
        ...state,
        joke: 'funny joke, haha',
      };
    default:
      return state;
  }
};
