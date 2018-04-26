import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * This is a simple button, use it! Markdown is *supported*.
 */
class SimpleButton extends Component {
  static propTypes = {
    /** The name of the button */
    name: PropTypes.string,
    bg: PropTypes.string,
  };
  static defaultProps = {
    name: 'Name',
    bg: '#ccc',
  };

  render() {
    return <a style={{ backgroundColor: this.props.bg }}>{this.props.name}</a>;
  }
}

export default SimpleButton;
