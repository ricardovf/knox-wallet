import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * This is a simple button, use it! Markdown is *supported*.
 */
class SimpleButton extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    name: PropTypes.string,
    bg: PropTypes.string,
  };
  static defaultProps = {
    name: 'Name',
    bg: '#ccc',
  };

  render() {
    return (
      <button
        onClick={this.props.onClick}
        style={{ backgroundColor: this.props.bg }}
      >
        {this.props.name}
      </button>
    );
  }
}

export default SimpleButton;
