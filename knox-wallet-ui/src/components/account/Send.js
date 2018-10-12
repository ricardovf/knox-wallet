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
import TextField from '@material-ui/core/TextField';
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
import { withRouter } from 'react-router';
import AccountLoading from './AccountLoading';
import AccountNotFound from './AccountNotFound';

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
    textAlign: 'right',
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
});

@withStyles(styles)
@inject('appStore', 'accountsStore')
@observer
export default class Send extends React.Component {
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

    if (!accountsLoaded) {
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
                      <InputLabel htmlFor="amount">Amount</InputLabel>
                      <Input
                        autoFocus
                        id="amount"
                        endAdornment={
                          <InputAdornment position="end">BTC</InputAdornment>
                        }
                      />
                      <FormHelperText>U$ 0</FormHelperText>
                    </FormControl>

                    <FormControl fullWidth className={classes.field}>
                      <InputLabel htmlFor="address">
                        Destination address
                      </InputLabel>
                      <Input id="address" />
                    </FormControl>

                    <FormControl fullWidth className={classes.field}>
                      <InputLabel style={{ position: 'relative' }}>
                        Fee
                      </InputLabel>

                      <Slider
                        className={classes.slider}
                        value={1}
                        min={0}
                        max={6}
                        step={1}
                        // onChange={this.handleChange}
                      />

                      <FormHelperText className={classes.sliderDescription}>
                        U$ 0.30 ~ 1 hour to confirm transaction
                      </FormHelperText>
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
                            1.232131322 BTC
                          </div>
                          <div className={classes.valueSecondary}>U$ 240</div>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem className={classes.detailsItem}>
                        <ListItemText primary="Amount to send" />
                        <ListItemSecondaryAction className={classes.values}>
                          <div className={classes.valueNegative}>-0.23 BTC</div>
                          <div className={classes.valueSecondary}>U$ 20</div>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem className={classes.detailsItem}>
                        <ListItemText primary="Fee" />
                        <ListItemSecondaryAction className={classes.values}>
                          <div className={classes.valueNegative}>
                            -0.00002 BTC
                          </div>
                          <div className={classes.valueSecondary}>U$ 0.3</div>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem className={classes.detailsItem}>
                        <ListItemText primary="Final balance" />
                        <ListItemSecondaryAction className={classes.values}>
                          <div className={classes.valuePositive}>
                            1.132131322 BTC
                          </div>
                          <div className={classes.valueSecondary}>U$ 230</div>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Paper>
                </div>
              </Grid>
            </Grid>

            <div className={classes.buttonContainer}>
              <Button variant={'raised'} color={'primary'}>
                Send
              </Button>
            </div>
          </div>
        </Paper>
      </div>
    );
  }
}
