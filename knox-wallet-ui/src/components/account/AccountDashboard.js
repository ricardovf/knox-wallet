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
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.props.appStore.changeSelectedAccount(this.props.match.params.id);
  }

  render() {
    const { classes, appStore, accountsStore, routing } = this.props;

    let account = accountsStore.accounts.get(appStore.selectedAccount);

    let accountsLoaded = accountsStore.loadAccounts.result !== undefined;

    // @todo put this code in a component
    if (!accountsLoaded) {
      return (
        <div className={classes.root}>
          <AccountMenu />
          <Paper className={classes.loadingPaper} square>
            <Loading text="Loading accounts..." />
          </Paper>
        </div>
      );
    } else if (!account) {
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

    // @todo if loading, show loading

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
              {`${account.balance} ${account.coin.symbol}`}
              <small>{`U$ ${account.balanceUSD}`}</small>
            </Typography>

            <TransactionsChart />
          </div>

          <div className={classes.header}>
            <Typography gutterBottom variant="title" className={classes.margin}>
              Transactions
            </Typography>
            <Divider />
          </div>

          <div className={classes.margin + ' ' + classes.marginNoTop}>
            <TransactionsTable />
          </div>
          <Divider />
          <div className={classes.margin + ' ' + classes.marginNoTop}>
            <TransactionsTable />
          </div>
        </Paper>
      </div>
    );
  }
}
