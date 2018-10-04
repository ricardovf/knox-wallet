import React from 'react';
import logo from '../media/img/logo-knox-horizontal-blue-bg.png';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Typography } from '@material-ui/core';
import { observer, inject } from 'mobx-react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import { __DEV__ } from '../Util';
import Footer from './Footer';

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
    const { classes, appStore, deviceStore } = this.props;

    return (
      <Router basename={__DEV__ ? undefined : '/knox-wallet-ui'}>
        <MuiThemeProvider theme={theme}>
          <AppBar position="static">
            <Toolbar className={classes.toolbar}>
              <img src={logo} height={65} className={classes.logo} />
            </Toolbar>
          </AppBar>
          Dashboard!
          <Footer />
        </MuiThemeProvider>
      </Router>
    );
  }
}
