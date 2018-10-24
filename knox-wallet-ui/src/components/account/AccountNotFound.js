import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AccountMenu from './AccountMenu';
import Paper from '@material-ui/core/Paper';
import Message from '../Message';
import { linkToAccounts } from '../../LinkMaker';

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
  goToDashboardButton: {
    marginTop: theme.spacing.unit * 2,
  },
});

@withStyles(styles)
@inject('routing')
@observer
export default class AccountNotFound extends React.Component {
  render() {
    const { classes, routing } = this.props;

    return (
      <div className={classes.root}>
        <AccountMenu />
        <Paper className={classes.loadingPaper} square>
          <Message
            text="Invalid account selected!"
            content={
              <Button
                className={classes.goToDashboardButton}
                size={'large'}
                variant={'raised'}
                color={'primary'}
                onClick={() => {
                  routing.push(linkToAccounts());
                }}
              >
                Go to dashboard
              </Button>
            }
          />
        </Paper>
      </div>
    );
  }
}
