import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import Typography from '@material-ui/core/Typography/Typography';

const styles = theme => ({
  root: {
    zIndex: 100,
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '0',
    right: '0',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  message: {
    width: '90%',
  },
});

@withStyles(styles)
export default class Message extends React.Component {
  render() {
    const { classes, size, text, variant, color, content } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.message}>
          {text && (
            <Typography
              variant={variant || 'body1'}
              color={color || 'textPrimary'}
            >
              {text}
            </Typography>
          )}
          {content}
        </div>
      </div>
    );
  }
}
