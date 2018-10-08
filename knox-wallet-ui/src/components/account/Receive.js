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
  render() {
    const { classes, appStore, accountsStore } = this.props;

    return (
      <div className={classes.root}>
        <AccountMenu />
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
            <AddressesTable />
            <Button variant={'raised'} color={'primary'}>
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
            <AddressesTable />
          </div>
        </Paper>
      </div>
    );
  }
}
