import React from 'react';
import SimpleButton from '../components/SimpleButton';
import { incrementCounter } from '../actions';
import { connect } from 'react-redux';

let Incrementer = ({ value, onClick }) => {
  return (
    <div>
      <h1>Valor atual: {value}</h1>
      <SimpleButton bg={'green'} name={'INCREMENT'} onClick={onClick} />
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  value: state.value,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => {
    dispatch(incrementCounter(1));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Incrementer);

// export default Incrementer;
