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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Chip from '@material-ui/core/Chip/Chip';

export const styles = theme => ({
  values: {
    fontSize: 16,
    '& > div:first-child': {
      marginBottom: 4,
    },
  },
  valuePositive: {
    color: '#2BAF2B',
  },
  valueNegative: {
    color: '#F44336',
  },
  valueSecondary: {
    color: theme.palette.text.secondary,
    fontWeight: 300,
  },
  address: {
    fontSize: 16,
    fontWeight: 400,
  },
  path: {
    marginTop: 4,
    color: theme.palette.text.secondary,
    paddingBottom: '14px',
  },
  buttons: {
    position: 'absolute',
    right: theme.spacing.unit,
    bottom: theme.spacing.unit * 2,
  },
  cell: {
    border: '0 !important',
  },
  row: {
    paddingBottom: '4px',
  },
});

@withStyles(styles)
@inject('appStore', 'accountsStore')
@observer
export default class TransactionsTable extends React.Component {
  render() {
    const {
      classes,
      appStore,
      accountsStore,
      transactionsByDay,
      account,
    } = this.props;

    let tables = [];
    for (let day of [...transactionsByDay.keys()]) {
      let transactions = transactionsByDay.get(day);

      tables.push(
        <Table className={classes.table} padding={'none'}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.cell}>{day}</TableCell>
              <TableCell numeric className={classes.cell}>
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(transaction => {
              return (
                <TableRow
                  hover
                  key={transaction.id}
                  className={classes.transaction}
                >
                  <TableCell
                    component="th"
                    scope="transaction"
                    className={classes.cell}
                  >
                    <div className={classes.address}>
                      {transaction.address}

                      <IconButton
                        component="a"
                        color="inherit"
                        title="Open transaction details in Blockchain explorer"
                        aria-label="Receive funds"
                        href={account.coin.transactionUrl + transaction.id}
                        target="_blank"
                      >
                        <Icon color={'secondary'} fontSize={'small'}>
                          open_in_new
                        </Icon>
                      </IconButton>
                      {transaction.confirmed ? (
                        ''
                      ) : (
                        <Chip
                          color="secondary"
                          icon={<Icon>error_outline</Icon>}
                          label="Unconfirmed"
                        />
                      )}
                    </div>
                    <div className={classes.path}>{transaction.hour} </div>
                  </TableCell>
                  <TableCell
                    numeric
                    className={classes.values + ' ' + classes.cell}
                  >
                    <div
                      className={
                        transaction.balance > 0
                          ? classes.valuePositive
                          : classes.valueNegative
                      }
                    >
                      {`${transaction.balance > 0 ? '+' : '-'} ${
                        transaction.balanceBTC
                      } ${account.coin.symbol}`}
                    </div>
                    <div className={classes.valueSecondary}>
                      U$ {transaction.balanceUSD}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      );
    }

    return tables;
  }
}
