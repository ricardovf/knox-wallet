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
    opacity: 0.8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  loading: {
    width: '90%',
  },
});

@withStyles(styles)
export default class Loading extends React.Component {
  render() {
    const { classes, size, text } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.loading}>
          <CircularProgress size={size || 28} />
          {text && (
            <Typography variant="caption" color="textSecondary">
              {text}
            </Typography>
          )}
        </div>
      </div>
    );
  }
}
