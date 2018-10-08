import React from 'react';
import logo from '../media/img/logo-knox-horizontal-blue-bg.png';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Typography } from '@material-ui/core';
import { observer, inject } from 'mobx-react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Footer from './Footer';
import MainLeftMenu from './MainLeftMenu';
import Accounts from './accounts/Accounts';
import Receive from './account/Receive';
import Send from './account/Send';
import Dashboard from './account/Dashboard';

const theme = createMuiTheme();

const styles = theme => ({
  '@global': {
    html: {
      WebkitFontSmoothing: 'antialiased', // Antialiasing.
      MozOsxFontSmoothing: 'grayscale', // Antialiasing.
      boxSizing: 'border-box',
      fontSize: '18px',
      backgroundColor: '#f2f2f2',
    },
  },
  root: {
    flexGrow: 1,
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  toolbar: {
    // ...theme.mixins.toolbar,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    display: 'flex',

    marginTop: '32px',
    marginBottom: '100px',
  },
  content: {
    // flexGrow: 1,
    // backgroundColor: theme.palette.background.default,
    // padding: theme.spacing.unit * 3,
  },
});

@withStyles(styles)
@inject('appStore', 'deviceStore')
@observer
export default class AppLayout extends React.Component {
  render() {
    const { classes, appStore } = this.props;

    /*<Router basename={__DEV__ ? undefined : '/knox-wallet-ui'}>*/

    let page;
    switch (appStore.page) {
      case 'receive':
        page = <Receive />;
        break;
      case 'send':
        page = <Send />;
        break;
      case 'account':
        page = <Dashboard />;
        break;
      case 'accounts':
        page = <Accounts />;
        break;
    }

    return (
      <MuiThemeProvider theme={theme}>
        <AppBar position="static">
          <Toolbar className={classes.toolbar}>
            <img src={logo} height={65} className={classes.logo} />
          </Toolbar>
        </AppBar>
        <MainLeftMenu />
        {page}
        <Footer />
      </MuiThemeProvider>
    );
  }
}
