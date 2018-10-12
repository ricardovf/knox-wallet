import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import logo from '../media/img/logo-knox-vertical-white-bg.png';
import { linkToAccounts, linkToSettings } from '../LinkMaker';

export const styles = theme => ({
  list: {
    width: 340,
  },
  fullList: {
    width: 'auto',
  },
  logoContainer: {
    // ...theme.mixins.toolbar,
    // display: 'flex',
    textAlign: 'center',
    marginTop: theme.spacing.unit * 4 + 8,
    marginBottom: theme.spacing.unit * 4,
  },
});

const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);

@withStyles(styles)
@inject('appStore', 'deviceStore', 'routing')
@observer
export default class MainLeftMenu extends React.Component {
  render() {
    const { classes, appStore, routing } = this.props;

    return (
      <SwipeableDrawer
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
        open={appStore.mainLeftMenuIsOpen}
        onClose={appStore.mainLeftMenuClose}
        onOpen={appStore.mainLeftMenuOpen}
      >
        <div className={classes.logoContainer}>
          <img alt="knox wallet" src={logo} style={{ height: 120 }} />
        </div>
        <Divider />

        <div className={classes.list}>
          <List component="nav">
            {/*<ListItem button component="a" href="/dashboard">*/}
            {/*<ListItemText primary="Dashboard" />*/}
            {/*</ListItem>*/}
            <ListItem
              button
              onClick={() => {
                routing.push(linkToAccounts());
                appStore.mainLeftMenuClose();
              }}
            >
              <ListItemText primary="Accounts" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                routing.push(linkToSettings());
                appStore.mainLeftMenuClose();
              }}
            >
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
        </div>
      </SwipeableDrawer>
    );
  }
}
