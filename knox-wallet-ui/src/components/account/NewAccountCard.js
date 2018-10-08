import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

export const styles = theme => ({
  card: {
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
          <Button variant={'flat'} color={'primary'}>
            New Account
          </Button>
        </CardContent>
      </Card>
    );
  }
}
