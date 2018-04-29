import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';

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
      <Button variant="raised" color="primary" onClick={this.props.onClick}>
        {this.props.name}
      </Button>
    );
  }
}

export default SimpleButton;
