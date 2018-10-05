import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';

const styles = theme => ({
  root: {
    zIndex: 100000,
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '0',
    right: '0',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    Width: '200px',
  },
});

@withStyles(styles)
export default class FullLoading extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.loading}>
          <CircularProgress size={48} />
        </div>
      </div>
    );
  }
}
