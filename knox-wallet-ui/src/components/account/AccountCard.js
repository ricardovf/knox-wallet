import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import iconBTC from '../../media/img/currency-icon-BTC.png';
import CardActionArea from '@material-ui/core/CardActionArea';

export const styles = theme => ({
  card: {
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
    const { classes, appStore, accountsStore, routing } = this.props;

    return (
      <Card
        innerRef={el => (this._cardElement = el)}
        className={classes.card}
        onClick={event => {
          event.stopPropagation();
          routing.push('/account');
        }}
      >
        <CardContent>
          <Typography
            className={classes.accountName}
            variant={'headline'}
            component="h2"
          >
            Account 1
          </Typography>
          <div className={classes.accountCurrencyLogo}>
            <img alt="Bitcoin" src={iconBTC} style={{ height: 38 }} />
          </div>
          <Typography color="textSecondary">Bitcoin</Typography>
          {/*<Divider />*/}
          <Typography className={classes.values} component="div">
            <div>0.12354266 BTC</div>
            <div className={classes.valuePositive}>U$ 872</div>
          </Typography>
          <div className={classes.buttons}>
            <IconButton
              title="Send funds"
              aria-label="Send funds"
              onClick={event => {
                event.stopPropagation();
                routing.push('/send');
              }}
            >
              <Icon>send</Icon>
            </IconButton>
            <IconButton
              title="Receive funds"
              aria-label="Receive funds"
              onClick={event => {
                event.stopPropagation();
                routing.push('/receive');
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
