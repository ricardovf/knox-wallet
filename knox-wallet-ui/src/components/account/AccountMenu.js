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
  accountName: {
    flexGrow: 1,
    '& span': {
      cursor: 'pointer',
    },
  },
  // coinsMenu: {
  //   padding: theme.spacing.unit * 1,
  // },
});

@withStyles(styles)
@inject('appStore', 'accountsStore', 'routing')
@observer
export default class AccountMenu extends React.Component {
  render() {
    const { classes, appStore, accountsStore, routing } = this.props;

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
              {/*<IconButton*/}
              {/*className={classes.menuButton}*/}
              {/*color="inherit"*/}
              {/*aria-label="Go back"*/}
              {/*onClick={() => routing.push('/')}*/}
              {/*>*/}
              {/*<Icon>home</Icon>*/}
              {/*</IconButton>*/}
              <Typography
                variant="subheading"
                color="inherit"
                className={classes.accountName}
              >
                <span
                  title="Go to Account 1 dashboard"
                  onClick={() => routing.push('/account')}
                >
                  Account 1
                </span>
              </Typography>

              <IconButton
                color="inherit"
                title="Send funds"
                aria-label="Send funds"
                onClick={() => routing.push('/send')}
              >
                <Icon>send</Icon>
              </IconButton>
              <IconButton
                color="inherit"
                title="Receive funds"
                aria-label="Receive funds"
                onClick={() => routing.push('/receive')}
              >
                <Icon>arrow_downward</Icon>
              </IconButton>
            </Toolbar>
          </AppBar>
        </div>
      </React.Fragment>
    );
  }
}
