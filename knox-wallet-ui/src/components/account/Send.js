import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AccountMenu from './AccountMenu';
import Grid from '@material-ui/core/Grid/Grid';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Slider from '@material-ui/lab/Slider';
import AccountLoading from './AccountLoading';
import AccountNotFound from './AccountNotFound';
import { action, computed, observable, when } from 'mobx';
import { BTCToUSD, satoshiToBTC } from '../../blockchain/Converter';
import { Big } from 'big.js';
import * as R from 'ramda';
import * as bitcoin from 'bitcoinjs-lib';
import VerifyPINModal from '../VerifyPINModal';
import SendSuccess from './SendSuccess';
import Icon from '@material-ui/core/Icon/Icon';
import IconButton from '@material-ui/core/IconButton/IconButton';

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
  grid: {
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 4,
  },

  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      display: 'inherit',
    },
  },
  inner: {
    width: '70%',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing.unit * 2,
      width: 'auto',
    },
  },
  details: {
    backgroundColor: '#FFFDE8',
    paddingBottom: theme.spacing.unit * 3,
  },
  detailsPadding: {
    padding: theme.spacing.unit * 2,
  },
  buttonContainer: {
    textAlign: 'center',
  },
  field: {
    margin: theme.spacing.unit,
  },
  values: {
    fontSize: 16,
    margin: theme.spacing.unit * 2,
    textAlign: 'right',
    '& > div:first-child': {
      marginBottom: 4,
    },
  },
  valuePositive: {
    color: '#2BAF2B',
  },
  valueNegative: {
    color: '#F44336',
  },
  valueSecondary: {
    color: theme.palette.text.secondary,
    fontWeight: 300,
  },
  detailsItem: {
    marginBottom: 6,
  },
  slider: {
    marginTop: theme.spacing.unit * 6,
  },
  sliderDescription: {
    marginTop: theme.spacing.unit * 2,
  },
  successMessage: {
    marginTop: theme.spacing.unit * 2,
  },
});

@withStyles(styles)
@inject('appStore', 'accountsStore')
@observer
export default class Send extends React.Component {
  // Prevent browser auto fill
  _formAmountId = `${Math.random()}`.substr(2);
  _formDestinationId = `${Math.random()}`.substr(2);

  @observable
  amount = new Big('0.0001'); // btc

  @observable
  feeSlider = 0; // slider

  @observable
  destination = 'mx5h2xV2djdopQjoPAK5uARLmMSa456pLj';

  @observable
  pinValidated = false;

  @observable
  requestedToSend = false;

  @computed
  get destinationValid() {
    let account = this.props.accountsStore.accounts.get(
      this.props.appStore.selectedAccount
    );
    if (this.destination.length > 0 && account) {
      try {
        bitcoin.address.toOutputScript(
          this.destination,
          account.coin.network === 'testnet'
            ? bitcoin.networks.testnet
            : bitcoin.networks.bitcoin
        );
        return true;
      } catch (e) {}
    }

    return false;
  }

  @computed
  get fee() {
    let fees = R.reverse(R.values(this.props.accountsStore.currentFees));
    return fees[this.feeSlider] ? fees[this.feeSlider].feeBTC : new Big(0);
  }

  @computed
  get feeLegend() {
    let fees = R.reverse(R.values(this.props.accountsStore.currentFees));

    return fees[this.feeSlider]
      ? `U$ ${BTCToUSD(this.fee)} ~ ${
          fees[this.feeSlider].minutes
        } minutes to confirm transaction (${fees[this.feeSlider].blocks} block${
          fees[this.feeSlider].blocks > 1 ? 's' : ''
        })`
      : '';
  }

  @computed
  get finalBalance() {
    let account = this.props.accountsStore.accounts.get(
      this.props.appStore.selectedAccount
    );
    if (account) {
      try {
        return satoshiToBTC(account.balance, false)
          .minus(this.amount ? this.amount : 0)
          .minus(this.fee ? this.fee : 0);
      } catch (e) {}
    }

    return new Big(0);
  }

  @computed
  get isValid() {
    const { appStore, accountsStore } = this.props;

    let account = accountsStore.accounts.get(appStore.selectedAccount);
    let fees = R.reverse(R.values(this.props.accountsStore.currentFees));

    if (
      account &&
      fees[this.feeSlider] &&
      this.amount &&
      this.amount.gt(0) &&
      this.finalBalance.gte(0) &&
      this.destination.length > 0 &&
      this.destinationValid
    ) {
      return true;
    }

    return false;
  }

  @action.bound
  changeFee(fee) {
    this.feeSlider = fee;
  }

  @action.bound
  changeAmount(amount) {
    try {
      amount = amount
        .replace(',', '.')
        .replace(/[^0-9.]/g, '')
        .trim();

      if (amount.length === 0) return (this.amount = null);
      // Only let one point
      if (
        amount.indexOf('.') &&
        amount.indexOf('.', amount.indexOf('.') + 1) !== -1
      ) {
        amount = amount.substr(0, amount.indexOf('.', amount.indexOf('.') + 1));
      }
      let originalAmount = amount;

      this.amount = new Big(amount);
      this.amount._addPoint =
        !this.amount.toString().includes('.') && originalAmount.includes('.');

      this.amount._addZeros = '';

      if (this.amount._addPoint) {
        if (originalAmount[originalAmount.length - 1] === '0')
          this.amount._addZeros = originalAmount.substr(
            originalAmount.indexOf('.') + 1
          );
      } else if (this.amount.toString().includes('.')) {
        if (originalAmount[originalAmount.length - 1] === '0')
          this.amount._addZeros = originalAmount.replace(
            this.amount.toString(),
            ''
          );
      }
    } catch (e) {}
  }

  @action.bound
  changeDestination(destination) {
    this.destination = destination;
  }

  @action.bound
  changePinValidated(validated) {
    this.pinValidated = validated;
  }

  @action.bound
  changeRequestedToSend(requested) {
    this.requestedToSend = requested;
  }

  @action.bound
  cancelSend() {
    this.requestedToSend = false;
    this.pinValidated = false;
  }

  @action.bound
  commitSend() {
    this.requestedToSend = true;
    this.pinValidated = true;

    let account = this.props.accountsStore.accounts.get(
      this.props.appStore.selectedAccount
    );

    let commit = () => {
      this.props.accountsStore.commitTransaction(
        account,
        this.amount,
        this.destination,
        this.fee
      );
    };

    this.props.accountsStore.loadTransactions(account);

    when(() => !this.props.accountsStore.loadTransactions.pending, commit);
  }

  constructor(props) {
    super(props);

    this.props.appStore.changeSelectedAccount(this.props.match.params.id);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.props.appStore.changeSelectedAccount(this.props.match.params.id);
  }

  componentDidMount() {
    this.changePinValidated(false);
    this.changeRequestedToSend(false);

    when(
      () => R.values(this.props.accountsStore.currentFees).length > 0,
      () =>
        this.changeFee(
          R.values(this.props.accountsStore.currentFees).length - 1
        )
    );
  }

  render() {
    const { classes, appStore, accountsStore } = this.props;

    let account = accountsStore.accounts.get(appStore.selectedAccount);
    let accountsLoaded = accountsStore.loadAccounts.result !== undefined;

    if (!accountsLoaded && !account) {
      return <AccountLoading />;
    } else if (accountsLoaded && !account) {
      return <AccountNotFound />;
    }

    if (this.requestedToSend && this.pinValidated) {
      let loading =
        accountsStore.loadTransactions.pending ||
        accountsStore.commitTransaction.pending;

      return (
        <SendSuccess
          loading={loading}
          error={!loading && accountsStore.commitTransaction.result === false}
          content={
            <Typography
              color="textSecondary"
              gutterBottom
              className={classes.successMessage}
            >
              Sent{' '}
              <strong>{`${this.amount.toString()} ${
                account.coin.symbol
              }`}</strong>{' '}
              {`(U$ ${BTCToUSD(this.amount)})`} to the address{' '}
              <strong>{this.destination}</strong>{' '}
              <IconButton
                component="a"
                color="inherit"
                title="Open transaction details in Blockchain explorer"
                aria-label="Receive funds"
                href={
                  account.coin.transactionUrl +
                  (loading
                    ? ''
                    : accountsStore.commitTransaction.result
                      ? accountsStore.commitTransaction.result.id
                      : '')
                }
                target="_blank"
              >
                <Icon color={'secondary'} fontSize={'small'}>
                  open_in_new
                </Icon>
              </IconButton>
            </Typography>
          }
          account={account}
        />
      );
    }

    let feesLoaded = R.values(accountsStore.currentFees).length > 0;

    return (
      <div className={classes.root}>
        <VerifyPINModal
          open={this.requestedToSend && !this.pinValidated}
          handleClose={this.cancelSend}
          handleSuccess={this.commitSend}
        />
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
            <Typography gutterBottom variant="headline">
              Send funds
            </Typography>
            <Typography variant="subheading" color="textSecondary">
              Double check the address and amount before confirming the
              transaction.
            </Typography>

            <Grid
              className={classes.grid}
              spacing={0}
              container
              alignItems={'stretch'}
            >
              <Grid item xs={12} sm={6}>
                <div className={classes.container}>
                  <div className={classes.inner}>
                    <FormControl fullWidth className={classes.field}>
                      <InputLabel htmlFor={this._formAmountId}>
                        Amount
                      </InputLabel>
                      <Input
                        value={
                          this.amount === null
                            ? ''
                            : this.amount.toString() +
                              (this.amount._addPoint ? '.' : '') +
                              (this.amount._addZeros
                                ? this.amount._addZeros
                                : '')
                        }
                        onChange={event => {
                          this.changeAmount(event.target.value);
                        }}
                        autoFocus
                        id={this._formAmountId}
                        endAdornment={
                          <InputAdornment position="end">
                            {account.coin.symbol}
                          </InputAdornment>
                        }
                      />
                      <FormHelperText>{`U$ ${BTCToUSD(
                        this.amount
                      )}`}</FormHelperText>
                    </FormControl>

                    <FormControl
                      fullWidth
                      className={classes.field}
                      error={
                        this.destination.length > 0 && !this.destinationValid
                      }
                    >
                      <InputLabel htmlFor={this._formDestinationId}>
                        Destination address
                      </InputLabel>
                      <Input
                        value={this.destination}
                        onChange={event => {
                          this.changeDestination(event.target.value);
                        }}
                        id={this._formDestinationId}
                      />
                      {this.destination.length > 0 &&
                        !this.destinationValid && (
                          <FormHelperText id="pin-text">
                            Invalid address
                          </FormHelperText>
                        )}
                    </FormControl>

                    <FormControl fullWidth className={classes.field}>
                      <InputLabel style={{ position: 'relative' }}>
                        Fee
                      </InputLabel>
                      {!feesLoaded && (
                        <FormHelperText
                          className={
                            classes.slider + ' ' + classes.valueNegative
                          }
                        >
                          Error loading fee estimation. Please try again later.
                        </FormHelperText>
                      )}
                      {feesLoaded && (
                        <React.Fragment>
                          <Slider
                            className={classes.slider}
                            value={this.feeSlider}
                            min={0}
                            max={R.keys(accountsStore.currentFees).length - 1}
                            step={1}
                            onChange={(event, value) => {
                              this.changeFee(value);
                            }}
                          />

                          <FormHelperText className={classes.sliderDescription}>
                            {this.feeLegend}
                          </FormHelperText>
                        </React.Fragment>
                      )}
                    </FormControl>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div className={classes.container}>
                  <Paper
                    className={classes.inner + ' ' + classes.details}
                    square
                    elevation={1}
                  >
                    <Typography
                      variant={'title'}
                      className={classes.detailsPadding}
                    >
                      Transaction details
                    </Typography>
                    <Divider />

                    <List>
                      <ListItem className={classes.detailsItem}>
                        <ListItemText primary="Current balance" />
                        <ListItemSecondaryAction className={classes.values}>
                          <div className={classes.valuePositive}>
                            {`${account.balanceBTC} ${account.coin.symbol}`}
                          </div>
                          <div className={classes.valueSecondary}>{`U$ ${
                            account.balanceUSD
                          }`}</div>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem className={classes.detailsItem}>
                        <ListItemText primary="Amount to send" />
                        <ListItemSecondaryAction className={classes.values}>
                          <div className={classes.valueNegative}>{`${
                            this.amount && this.amount.gt(0) ? '-' : ''
                          }${this.amount ? this.amount.toString() : 0} ${
                            account.coin.symbol
                          }`}</div>
                          <div
                            className={classes.valueSecondary}
                          >{`U$ ${BTCToUSD(this.amount)}`}</div>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem className={classes.detailsItem}>
                        <ListItemText primary="Fee" />
                        <ListItemSecondaryAction className={classes.values}>
                          <div
                            className={classes.valueNegative}
                          >{`-${this.fee.toString()} ${
                            account.coin.symbol
                          }`}</div>
                          <div
                            className={classes.valueSecondary}
                          >{`U$ ${BTCToUSD(this.fee)}`}</div>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem className={classes.detailsItem}>
                        <ListItemText primary="Final balance" />
                        <ListItemSecondaryAction className={classes.values}>
                          <div
                            className={
                              this.finalBalance.gt(0)
                                ? classes.valuePositive
                                : classes.valueNegative
                            }
                          >{`${this.finalBalance.toString()} ${
                            account.coin.symbol
                          }`}</div>
                          <div
                            className={classes.valueSecondary}
                          >{`U$ ${BTCToUSD(this.finalBalance)}`}</div>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Paper>
                </div>
              </Grid>
            </Grid>

            <div className={classes.buttonContainer}>
              <Button
                disabled={!this.isValid}
                size={'large'}
                variant={'raised'}
                color={'primary'}
                onClick={() => {
                  this.changeRequestedToSend(true);
                }}
              >
                Send
              </Button>
            </div>
          </div>
        </Paper>
      </div>
    );
  }
}
