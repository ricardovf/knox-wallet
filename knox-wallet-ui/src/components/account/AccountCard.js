import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import { linkToAccount, linkToReceive, linkToSend } from '../../LinkMaker';

export const styles = theme => ({
  card: {
    height: '100%',
    position: 'relative',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f2f2f2',
    },
  },
  accountName: {
    fontSize: 20,
  },
  accountCurrencyLogo: {
    position: 'absolute',
    right: theme.spacing.unit * 2,
    top: theme.spacing.unit * 2,
  },
  values: {
    marginTop: theme.spacing.unit * 2,
    fontSize: 14,
    position: 'relative',
  },
  valuePositive: {
    marginTop: 4,
    color: '#2BAF2B',
  },
  buttons: {
    position: 'absolute',
    right: theme.spacing.unit,
    bottom: theme.spacing.unit * 2,
  },
});

@withStyles(styles)
@inject('appStore', 'accountsStore', 'routing')
@observer
export default class AccountCard extends React.Component {
  render() {
    const {
      classes,
      appStore,
      accountsStore,
      routing,
      loading,
      account,
    } = this.props;

    return (
      <Card
        innerRef={el => (this._cardElement = el)}
        className={classes.card}
        onClick={event => {
          event.stopPropagation();
          routing.push(linkToAccount(account));
        }}
      >
        <CardContent>
          <Typography
            className={classes.accountName}
            variant={'headline'}
            component="h2"
          >
            {account.name}
          </Typography>
          <div className={classes.accountCurrencyLogo}>
            <img
              alt={account.coin.name}
              src={account.coin.icon}
              style={{ height: 38 }}
            />
          </div>
          <Typography color="textSecondary">{account.coin.name}</Typography>
          {/*<Divider />*/}
          <Typography className={classes.values} component="div">
            {loading && <CircularProgress size={24} />}
            {!loading && (
              <React.Fragment>
                <div>{`${account.balanceBTC} ${account.coin.symbol}`}</div>
                <div className={classes.valuePositive}>{`U$ ${
                  account.balanceUSD
                }`}</div>
              </React.Fragment>
            )}
          </Typography>
          <div className={classes.buttons}>
            <IconButton
              title="Send funds"
              aria-label="Send funds"
              onClick={event => {
                event.stopPropagation();
                routing.push(linkToSend(account));
              }}
            >
              <Icon>send</Icon>
            </IconButton>
            <IconButton
              title="Receive funds"
              aria-label="Receive funds"
              onClick={event => {
                event.stopPropagation();
                routing.push(linkToReceive(account));
              }}
            >
              <Icon>arrow_downward</Icon>
            </IconButton>
          </div>
        </CardContent>
      </Card>
    );
  }
}
