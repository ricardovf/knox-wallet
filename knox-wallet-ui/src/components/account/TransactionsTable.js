import React from 'react';
import { withStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Chip from '@material-ui/core/Chip/Chip';
import * as R from 'ramda';

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
  mono: {
    fontFamily: 'monospace',
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
export default class TransactionsTable extends React.Component {
  render() {
    const { classes, transactionsByDay, account } = this.props;

    let tables = [];
    for (let day of R.keys(transactionsByDay)) {
      let transactions = transactionsByDay[day];

      tables.push(
        <Table key={day} className={classes.table} padding={'none'}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.cell}>
                <strong>{day}</strong>
              </TableCell>
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
                  key={
                    day +
                    transaction.id +
                    transaction.address +
                    transaction.valueBTC
                  }
                  className={classes.transaction}
                >
                  <TableCell
                    component="th"
                    scope="transaction"
                    className={classes.cell}
                  >
                    <div className={classes.address}>
                      <span className={classes.mono}>
                        {transaction.address}
                      </span>{' '}
                      {transaction.isInternalAddress && (
                        <Chip
                          variant="outlined"
                          color="default"
                          // icon={<Icon>error_outline</Icon>}
                          label="This is a change address"
                        />
                      )}
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
                      {!transaction.confirmed && (
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
                        transaction.value > 0
                          ? classes.valuePositive
                          : classes.valueNegative
                      }
                    >
                      {`${transaction.value > 0 ? '+' : ''} ${
                        transaction.valueBTC
                      } ${account.coin.symbol}`}
                    </div>
                    <div className={classes.valueSecondary}>
                      U$ {transaction.valueUSD}
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
