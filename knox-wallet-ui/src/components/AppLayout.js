import React from 'react';
import logo from '../media/img/logo-knox-horizontal-blue-bg.png';
import {
  createMuiTheme,
  MuiThemeProvider,
  withStyles,
} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { inject, observer } from 'mobx-react';
import Footer from './Footer';
import MainLeftMenu from './MainLeftMenu';
import Accounts from './accounts/Accounts';
import Receive from './account/Receive';
import Send from './account/Send';
import AccountDashboard from './account/AccountDashboard';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import { linkToAccounts } from '../LinkMaker';

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
    cursor: 'pointer',

    marginTop: '32px',
    marginBottom: '100px',
  },
  content: {
    // flexGrow: 1,
    // backgroundColor: theme.palette.background.default,
    // padding: theme.spacing.unit * 3,
  },
});

const NotFound = function() {
  return <div>Página não encontrada</div>;
};

@withStyles(styles)
@inject('appStore', 'deviceStore', 'accountsStore', 'routing')
@withRouter
@observer
export default class AppLayout extends React.Component {
  componentDidMount() {
    this.props.accountsStore.autoRefreshAccountsStart();
  }

  componentWillUnmount() {
    this.props.accountsStore.autoRefreshAccountsStop();
  }

  render() {
    const { classes, appStore, routing, match } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <AppBar position="static">
          <Toolbar className={classes.toolbar}>
            <img
              src={logo}
              height={65}
              className={classes.logo}
              onClick={() => {
                routing.push(linkToAccounts());
              }}
            />
          </Toolbar>
        </AppBar>
        <MainLeftMenu />
        <Switch>
          <Route exact path="/accounts" component={Accounts} />
          <Route path="/account/:id/receive" component={Receive} />
          <Route path="/account/:id/send" component={Send} />
          <Route path="/account/:id" component={AccountDashboard} />
          <Redirect exact from="/" to="/accounts" />
          <Route component={NotFound} />
        </Switch>
        <Footer />
      </MuiThemeProvider>
    );
  }
}
