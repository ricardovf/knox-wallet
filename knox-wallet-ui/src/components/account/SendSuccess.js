import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import AccountMenu from './AccountMenu';
import Paper from '@material-ui/core/Paper';
import Message from '../Message';
import { linkToAccount, linkToAccounts, linkToSend } from '../../LinkMaker';
import Icon from '@material-ui/core/Icon/Icon';
import Typography from '@material-ui/core/Typography/Typography';
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
  goToDashboardButton: {
    marginTop: theme.spacing.unit * 4,
  },
});

@withStyles(styles)
@inject('routing')
@observer
export default class SendSuccess extends React.Component {
  render() {
    const { classes, routing, account, content, loading, error } = this.props;

    let back = (
      <Button
        className={classes.goToDashboardButton}
        size={'large'}
        variant={'raised'}
        color={'primary'}
        onClick={() => {
          routing.push(linkToAccount(account));
        }}
      >
        Go to the account dashboard
      </Button>
    );

    return (
      <div className={classes.root}>
        <AccountMenu />
        <Paper className={classes.loadingPaper} square>
          {loading && (
            <Paper className={classes.loadingPaper} square>
              <Loading text="Preparing transaction..." />
            </Paper>
          )}
          {!loading &&
            error && (
              <Message
                content={
                  <React.Fragment>
                    <Icon style={{ fontSize: 90, color: '#F44336' }}>
                      error_outline
                    </Icon>

                    <Typography variant="title" gutterBottom>
                      An error happened while preparing the transaction
                    </Typography>

                    <Typography variant="subheading" color={'textSecondary'}>
                      Please try again in a few moments
                    </Typography>

                    {back}
                  </React.Fragment>
                }
              />
            )}
          {!loading &&
            !error && (
              <Message
                content={
                  <React.Fragment>
                    <Icon style={{ fontSize: 90, color: '#2BAF2B' }}>
                      check_circle
                    </Icon>

                    <Typography variant="title">
                      Transaction confirmed!
                    </Typography>

                    {content}
                    {back}
                  </React.Fragment>
                }
              />
            )}
        </Paper>
      </div>
    );
  }
}
