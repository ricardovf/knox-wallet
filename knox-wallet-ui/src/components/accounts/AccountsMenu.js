import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

export const styles = theme => ({
  root: {
    marginTop: '-64px',
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      width: theme.breakpoints.values.lg,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },

  appBarContainer: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: '#303F9F',
  },
  menuButton: {
    marginLeft: -18,
    marginRight: 10,
  },

  // coinsMenu: {
  //   padding: theme.spacing.unit * 1,
  // },
});

@withStyles(styles)
@inject('appStore', 'accountsStore')
@observer
export default class AccountsMenu extends React.Component {
  handleCoinsMenuChange = (event, value) => {
    this.props.accountsStore.changeSelectedCoin(value);
  };

  render() {
    const { classes, appStore, accountsStore } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.appBarContainer}>
          <AppBar className={classes.appBar} position="static">
            <Toolbar>
              <IconButton
                className={classes.menuButton}
                color="inherit"
                aria-label="Menu"
                onClick={appStore.mainLeftMenuToggle}
              >
                <Icon>menu</Icon>
              </IconButton>
              <Typography variant="subheading" color="inherit">
                Accounts
              </Typography>
            </Toolbar>
          </AppBar>
        </div>
        <Paper square>
          <Tabs
            value={accountsStore.selectedCoin}
            indicatorColor="primary"
            textColor="primary"
            onChange={this.handleCoinsMenuChange}
          >
            <Tab value="All" label="All" />
            <Tab value="BTC" label="Bitcoin" />
            <Tab value="MON" label="Monero" />
            <Tab value="BLE" label="Ble21" />
          </Tabs>
        </Paper>
      </div>
    );
  }
}
