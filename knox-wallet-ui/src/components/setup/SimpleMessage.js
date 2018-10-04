import React from 'react';
import BasePaper, { styles as baseStyle } from './BasePaper';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => {
  return {
    ...baseStyle(theme),
  };
};

@withStyles(styles)
export default class SimpleMessage extends BasePaper {
  render() {
    const { content, classes } = this.props;

    this.content = <div className={classes.paperSpaceLarge}>{content}</div>;

    return super.render();
  }
}
