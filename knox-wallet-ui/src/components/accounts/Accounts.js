import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AccountCard from '../account/AccountCard';
import AccountsMenu from './AccountsMenu';
import Grid from '@material-ui/core/Grid/Grid';
import NewAccountCard from '../account/NewAccountCard';
import { withRouter } from 'react-router';
import * as R from 'ramda';
import { values } from 'mobx';

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
  grid: {
    marginTop: theme.spacing.unit * 2,
  },
});

@withStyles(styles)
@inject('appStore', 'accountsStore')
@observer
export default class Accounts extends React.Component {
  render() {
    const { classes, appStore, accountsStore } = this.props;

    return (
      <div className={classes.root}>
        <AccountsMenu />
        <Grid
          className={classes.grid}
          spacing={24}
          container
          alignItems={'stretch'}
        >
          {values(accountsStore.accounts).map(account => {
            return (
              <Grid
                key={account.getIdentifier()}
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
              >
                <AccountCard account={account} />
              </Grid>
            );
          })}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <NewAccountCard />
          </Grid>
        </Grid>
      </div>
    );
  }
}
