import React from 'react';
import PropTypes from 'prop-types';
import logo from '../../media/img/logo-knox-horizontal-blue-bg.png';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import { Route, Switch } from 'react-router-dom';
import Toolbar from '@material-ui/core/Toolbar';
import { Typography } from '@material-ui/core';
import InstallConnector from './InstallConnector';
import ConnectDevice from './ConnectDevice';
import CreateOrRecovery from './CreateOrRecovery';
import CreateSetName from './CreateSetName';
import CreateSetPIN from './CreateSetPIN';
import CreateRecovery from './CreateRecovery';
import { observer, inject } from 'mobx-react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme();

const NotFound = () => 'Page not found';

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
  footer: {
    marginTop: theme.spacing.unit * 6,
    padding: theme.spacing.unit,
    textAlign: 'center',
  },
});

@withStyles(styles)
@inject('deviceStore')
@observer
export default class LayoutSetup extends React.Component {
  render() {
    const { classes, deviceStore } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <AppBar position="static">
          <Toolbar className={classes.toolbar}>
            <img src={logo} height={65} className={classes.logo} />
          </Toolbar>
        </AppBar>
        <main className={classes.content}>
          <Switch>
            <Route exact path="/" component={InstallConnector} />
            <Route exact path="/usb" component={ConnectDevice} />
            <Route
              exact
              path="/create-or-recovery"
              component={CreateOrRecovery}
            />
            <Route exact path="/create-set-name" component={CreateSetName} />
            <Route exact path="/create-set-pin" component={CreateSetPIN} />
            <Route exact path="/create-recovery" component={CreateRecovery} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <div className={classes.footer}>
          <Typography variant="caption" color="textSecondary">
            Ricardo Vieira Fritsche © 2018
          </Typography>

          <Typography variant="caption" color="textSecondary">
            Firmware version: {deviceStore.firmwareVersion}
          </Typography>
        </div>
      </MuiThemeProvider>
    );
  }
}
