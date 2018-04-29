import React from 'react';
import SimpleButton from '../components/SimpleButton';
import { fetchJoke } from '../actions';
import { connect } from 'react-redux';

let Joker = ({ joke, onClick }) => {
  return (
    <div>
      <h1>{joke}</h1>
      <SimpleButton bg={'blue'} name={'GET NEW JOKE'} onClick={onClick} />
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  joke: state.joker.joke,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => {
    dispatch(fetchJoke());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Joker);
