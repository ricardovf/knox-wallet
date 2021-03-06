import React from 'react';
import logo from '../../media/img/logo-knox-horizontal-blue-bg.png';
import {
  createMuiTheme,
  MuiThemeProvider,
  withStyles,
} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import InstallConnector from './InstallConnector';
import ConnectDevice from './ConnectDevice';
import CreateOrRecovery from './CreateOrRecovery';
import { inject, observer } from 'mobx-react';
import Footer from '../Footer';
import {
  STATE_INSTALLED,
  STATE_PIN_SET,
  STATE_READY,
  STATE_SETUP_DONE,
} from '../../device/Constants';
import SimpleMessage from './SimpleMessage';
import { SETUP_IS_CREATING, SETUP_IS_RECOVERING } from '../../store/AppStore';
import Create from './Create';
import Recovery from './Recovery';

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
@inject('appStore', 'deviceStore')
@observer
export default class SetupLayout extends React.Component {
  render() {
    const { classes, appStore, deviceStore } = this.props;

    let isConnectorInstalled = deviceStore.isConnectorInstalled;
    let hasDevice = deviceStore.hasDeviceConnected;
    let state = deviceStore.state;

    let component = null;

    if (!isConnectorInstalled) {
      component = <InstallConnector />;
    } else if (!hasDevice) {
      component = <ConnectDevice />;
    } else {
      switch (state) {
        case STATE_INSTALLED:
          // must make setup
          component = <CreateOrRecovery />;
          break;
        case STATE_SETUP_DONE:
        case STATE_PIN_SET:
          if (appStore.setupIsCreatingOrRecovering === undefined) {
            component = <CreateOrRecovery />;
          } else if (
            appStore.setupIsCreatingOrRecovering === SETUP_IS_CREATING
          ) {
            component = <Create />;
          } else if (
            appStore.setupIsCreatingOrRecovering === SETUP_IS_RECOVERING
          ) {
            component = <Recovery />;
          } else {
            component = 'Setup error: unknown state';
          }
          break;
        case STATE_READY:
          component = <SimpleMessage content="Device is ready." />;
      }
    }

    return (
      <MuiThemeProvider theme={theme}>
        <AppBar position="static">
          <Toolbar className={classes.toolbar}>
            <img src={logo} height={65} className={classes.logo} />
          </Toolbar>
        </AppBar>
        <main className={classes.content}>{component}</main>
        <Footer />
      </MuiThemeProvider>
    );
  }
}
