import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
  return (
    <div>
      <Link to="incrementer">Increment</Link>
      {' | '}
      <Link to="joker">Joker</Link>
    </div>
  );
};
