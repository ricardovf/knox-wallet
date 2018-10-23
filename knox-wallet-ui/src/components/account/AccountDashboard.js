import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import AccountMenu from './AccountMenu';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import TransactionsTable from './TransactionsTable';
import TransactionsChart from './TransactionsChart';
import AccountNotFound from './AccountNotFound';
import AccountLoading from './AccountLoading';
import { values } from 'mobx';
import Transaction from '../../blockchain/Transaction';
import * as R from 'ramda';

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
  margin: {
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing.unit * 3,
    },
  },
  marginNoTop: {
    paddingTop: 0,
  },
  header: {
    backgroundColor: '#f2f2f2',
    '& > h2': {
      margin: 0,
      paddingTop: theme.spacing.unit * 2,
      paddingBottom: theme.spacing.unit * 2,
      fontSize: '20px',
    },
  },
  accountCurrencyLogo: {
    position: 'relative',
    // right: theme.spacing.unit * 2,
    // top: theme.spacing.unit * 2,
    '& img': {
      height: 28,
      position: 'absolute',
      marginTop: -2,
      marginLeft: 8,
    },
  },
  valueDollar: {
    marginBottom: theme.spacing.unit * 4,
    '& small': {
      color: theme.palette.text.secondary,
      marginLeft: '16px',
      fontWeight: 300,
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
@inject('appStore', 'accountsStore', 'routing')
@observer
export default class AccountDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.props.appStore.changeSelectedAccount(this.props.match.params.id);

    if (!this.props.accountsStore.loadTransactions.pending)
      this.props.accountsStore.loadTransactions();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.props.appStore.changeSelectedAccount(this.props.match.params.id);

    if (!this.props.accountsStore.loadTransactions.pending)
      this.props.accountsStore.loadTransactions();
  }

  render() {
    const { classes, appStore, accountsStore, routing } = this.props;

    let account = accountsStore.accounts.get(appStore.selectedAccount);
    let accountsLoaded = accountsStore.loadAccounts.result !== undefined;

    if (!accountsLoaded) {
      return <AccountLoading />;
    } else if (!account) {
      return <AccountNotFound />;
    }

    let transactionsByDay = Transaction.getReceivedByDay(
      values(account.transactions),
      R.map(R.prop('address'), values(account.addresses))
    );

    return (
      <div className={classes.root}>
        <AccountMenu account={account} />

        <Paper className={classes.paper} square>
          <div className={classes.margin}>
            <Typography
              color="textSecondary"
              gutterBottom
              className={classes.accountCurrencyLogo}
            >
              {account.coin.name}{' '}
              <img alt={account.coin.name} src={account.coin.icon} />
            </Typography>
            <Typography variant="headline" className={classes.valueDollar}>
              {`${account.balanceBTC} ${account.coin.symbol}`}
              <small>{`U$ ${account.balanceUSD}`}</small>
            </Typography>

            <TransactionsChart
              transactionsByDay={transactionsByDay}
              account={account}
            />
          </div>

          <div className={classes.header}>
            <Typography gutterBottom variant="title" className={classes.margin}>
              Transactions
            </Typography>
            <Divider />
          </div>

          <div className={classes.margin + ' ' + classes.marginNoTop}>
            <TransactionsTable
              transactionsByDay={transactionsByDay}
              account={account}
            />
          </div>
        </Paper>
      </div>
    );
  }
}
