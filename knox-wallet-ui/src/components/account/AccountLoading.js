import React from 'react';
import { withStyles } from '@material-ui/core';
import AccountMenu from './AccountMenu';
import Paper from '@material-ui/core/Paper';
import Loading from '../Loading';

export const styles = theme => ({
  root: {
    marginTop: '-64px',
    width: 'auto',
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up('lg')]: {
      width: theme.breakpoints.values.lg,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: '-56px',
    },
  },
  loadingPaper: {
    position: 'relative',
    minHeight: 400,
  },
});

@withStyles(styles)
export default class AccountLoading extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AccountMenu />
        <Paper className={classes.loadingPaper} square>
          <Loading text="Loading accounts..." />
        </Paper>
      </div>
    );
  }
}
