import React from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
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
@inject('appStore', 'accountsStore')
@observer
export default class AddressesTable extends React.Component {
  render() {
    const { classes, appStore, accountsStore, addresses } = this.props;

    if (!addresses) return null;

    return (
      <Table className={classes.table} padding={'none'}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.cell}>Address</TableCell>
            <TableCell numeric className={classes.cell}>
              Balance
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {addresses.map(address => {
            return (
              <TableRow hover key={address.address} className={classes.address}>
                <TableCell
                  component="th"
                  scope="address"
                  className={classes.cell}
                >
                  <div className={classes.address}>
                    <span className={classes.mono}>{address.address}</span>{' '}
                    {address.internal && (
                      <Chip
                        variant="outlined"
                        color="default"
                        // icon={<Icon>error_outline</Icon>}
                        label="This is a change address"
                      />
                    )}
                    {address.hasUnconfirmedBalance && (
                      <Chip
                        color="secondary"
                        icon={<Icon>error_outline</Icon>}
                        label="Unconfirmed"
                      />
                    )}
                  </div>
                  <div className={classes.path}>{address.path}</div>
                </TableCell>
                <TableCell
                  numeric
                  className={classes.values + ' ' + classes.cell}
                >
                  <div
                    className={
                      address.balance > 0 ? classes.valuePositive : undefined
                    }
                  >
                    {address.balanceBTC} {address.coinSymbol}
                  </div>
                  {address.balance > 0 && (
                    <div className={classes.valueSecondary}>
                      U$ {address.balanceUSD}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }
}
