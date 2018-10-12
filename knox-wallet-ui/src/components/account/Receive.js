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
import { withRouter } from 'react-router';
import AccountLoading from './AccountLoading';
import AccountNotFound from './AccountNotFound';
import * as R from 'ramda';
import Tab from '@material-ui/core/Tab/Tab';
import { observable, runInAction, values, action, computed } from 'mobx';

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
});

@withStyles(styles)
@inject('appStore', 'accountsStore')
@observer
export default class Receive extends React.Component {
  @computed
  get previousAddresses() {
    const { appStore, accountsStore } = this.props;

    let account = accountsStore.accounts.get(appStore.selectedAccount);
    let accountsLoaded = accountsStore.loadAccounts.result !== undefined;
    let addressesLoaded = accountsStore.loadAddresses.result !== undefined;

    if (account && accountsLoaded && addressesLoaded) {
      return R.map(address => {
        return {
          id: address.index,
          address: address.address,
          path: address.path,
          balance: address.balance,
          balanceBTC: address.balanceBTC,
          balanceUSD: address.balanceUSD,
          coinSymbol: account.coin.symbol,
        };
      }, R.filter(address => address.balance > 0, values(account.addresses)));
    }

    return [];
  }

  @computed
  get freshAddresses() {
    const { appStore, accountsStore } = this.props;

    let account = accountsStore.accounts.get(appStore.selectedAccount);
    let accountsLoaded = accountsStore.loadAccounts.result !== undefined;
    let addressesLoaded = accountsStore.loadAddresses.result !== undefined;

    if (account && accountsLoaded && addressesLoaded) {
      return R.map(address => {
        return {
          id: address.index,
          address: address.address,
          path: address.path,
          balance: address.balance,
          balanceBTC: address.balanceBTC,
          balanceUSD: address.balanceUSD,
          coinSymbol: account.coin.symbol,
        };
      }, R.filter(address => address.balance == 0, values(account.addresses)));
    }

    return [];
  }

  constructor(props) {
    super(props);

    this.props.appStore.changeSelectedAccount(this.props.match.params.id);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.props.appStore.changeSelectedAccount(this.props.match.params.id);
  }

  render() {
    const { classes, appStore, accountsStore } = this.props;

    let account = accountsStore.accounts.get(appStore.selectedAccount);
    let accountsLoaded = accountsStore.loadAccounts.result !== undefined;
    let addressesLoaded = accountsStore.loadAddresses.result !== undefined;

    if (!accountsLoaded || !addressesLoaded) {
      return <AccountLoading />;
    } else if (!account) {
      return <AccountNotFound />;
    }

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
              Bitcoin <img alt="Bitcoin" src={iconBTC} />
            </Typography>
            <Typography gutterBottom variant="headline">
              Receive funds
            </Typography>
            <Typography variant="subheading" color="textSecondary">
              You should always use a fresh address to receive funds, this way
              you guarantee more security and privacy.
            </Typography>
          </div>

          <div className={classes.header}>
            <Typography gutterBottom variant="title" className={classes.margin}>
              Fresh address
            </Typography>
            <Divider />
          </div>
          <div className={classes.margin + ' ' + classes.marginNoTop}>
            <AddressesTable addresses={this.freshAddresses} />
            <Button
              onClick={() => {
                accountsStore.addFreshAddress();
              }}
              disabled={
                accountsStore.addFreshAddress.result !== undefined &&
                accountsStore.addFreshAddress.pending
                  ? true
                  : undefined
              }
              variant={'raised'}
              color={'primary'}
            >
              New address
            </Button>
          </div>

          <div className={classes.header}>
            <Typography gutterBottom variant="title" className={classes.margin}>
              Previous addresses
            </Typography>
            <Divider />
          </div>
          <div className={classes.margin + ' ' + classes.marginNoTop}>
            <AddressesTable addresses={this.previousAddresses} />
          </div>
        </Paper>
      </div>
    );
  }
}
