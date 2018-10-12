import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Loading from '../Loading';
import { COIN_SELECTION_ALL } from '../../store/AppStore';
import Typography from '@material-ui/core/Typography/Typography';
import { coins } from '../../blockchain/Coins';

export const styles = theme => ({
  card: {
    position: 'relative',
    backgroundColor: 'transparent',
    border: '2px #ccc dashed',
    height: '100%',
    minHeight: 110,
    '&:hover': {
      // backgroundColor: '#f2f2f2',
    },
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 0,
  },
});

@withStyles(styles)
@inject('appStore', 'accountsStore')
@observer
export default class NewAccountCard extends React.Component {
  render() {
    const { classes, appStore, accountsStore } = this.props;

    return (
      <Card className={classes.card} elevation={0}>
        <CardContent className={classes.content}>
          {accountsStore.loadAccounts.pending && (
            <Loading text="Loading accounts" />
          )}
          {!accountsStore.loadAccounts.pending &&
            appStore.selectedCoin !== COIN_SELECTION_ALL && (
              <Button variant={'flat'} color={'primary'}>
                New {coins[appStore.selectedCoin].name} Account
              </Button>
            )}
          {!accountsStore.loadAccounts.pending &&
            appStore.selectedCoin === COIN_SELECTION_ALL && (
              <Typography variant="caption" color="textSecondary">
                Select a coin to create an account
              </Typography>
            )}
        </CardContent>
      </Card>
    );
  }
}
