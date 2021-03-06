import React from 'react';
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
import * as R from 'ramda';
import { COIN_SELECTION_ALL } from '../../store/AppStore';

export const styles = theme => ({
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
});

@withStyles(styles)
@inject('appStore', 'accountsStore', 'routing')
@observer
export default class AccountsMenu extends React.Component {
  handleCoinsMenuChange = (event, value) => {
    this.props.appStore.changeSelectedCoin(value);
  };

  render() {
    const { classes, appStore, accountsStore, routing } = this.props;

    const tabs = R.map(coin => {
      return <Tab key={coin.key} value={coin.key} label={coin.name} />;
    }, R.values(accountsStore.coins));

    return (
      <React.Fragment>
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
            value={
              appStore.selectedCoin === COIN_SELECTION_ALL
                ? COIN_SELECTION_ALL
                : accountsStore.coins[appStore.selectedCoin]
                  ? accountsStore.coins[appStore.selectedCoin].key
                  : undefined
            }
            indicatorColor="primary"
            textColor="primary"
            onChange={this.handleCoinsMenuChange}
          >
            <Tab
              key={COIN_SELECTION_ALL}
              value={COIN_SELECTION_ALL}
              label="All"
            />
            {tabs}
          </Tabs>
        </Paper>
      </React.Fragment>
    );
  }
}
