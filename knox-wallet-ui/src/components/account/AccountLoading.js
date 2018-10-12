import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AccountCard from '../account/AccountCard';
import AccountMenu from './AccountMenu';
import Grid from '@material-ui/core/Grid/Grid';
import NewAccountCard from '../account/NewAccountCard';
import Paper from '@material-ui/core/Paper';
import { paperWidth } from '../setup/BasePaper';
import iconBTC from '../../media/img/currency-icon-BTC.png';
import Divider from '@material-ui/core/Divider';
import AddressesTable from './AddressesTable';
import TransactionsTable from './TransactionsTable';
import TransactionsChart from './TransactionsChart';
import { withRouter } from 'react-router';
import Loading from '../Loading';
import Message from '../Message';
import { linkToAccount, linkToAccounts } from '../../LinkMaker';

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
