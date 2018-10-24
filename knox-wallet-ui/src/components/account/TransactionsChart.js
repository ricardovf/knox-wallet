import React from 'react';
import ResponsiveContainer from 'recharts/lib/component/ResponsiveContainer';
import LineChart from 'recharts/lib/chart/LineChart';
import Line from 'recharts/lib/cartesian/Line';
import XAxis from 'recharts/lib/cartesian/XAxis';
import YAxis from 'recharts/lib/cartesian/YAxis';
import CartesianGrid from 'recharts/lib/cartesian/CartesianGrid';
import Tooltip from 'recharts/lib/component/Tooltip';
import { Big } from 'big.js';
import { BTCToSatoshi, satoshiToUSD } from '../../blockchain/Converter';
import { isNumOrStr } from 'recharts/src/util/DataUtils';
import { Bar, ComposedChart, Scatter } from 'recharts';
import * as R from 'ramda';

const tooltipFormatter = value =>
  Array.isArray(value) && isNumOrStr(value[0]) && isNumOrStr(value[1])
    ? value.join(' ~ ')
    : value;

export default class TransactionsChart extends React.Component {
  render() {
    const { transactionsByDay, account } = this.props;

    let data = [];
    let balance = new Big(0);
    for (let day of R.reverse(R.keys(transactionsByDay))) {
      let transactions = transactionsByDay[day];
      let dayReceived = new Big(0);
      let daySent = new Big(0);

      for (let transaction of transactions) {
        if (transaction.value.gt(0))
          dayReceived = dayReceived.plus(transaction.value);
        else daySent = daySent.plus(transaction.value.abs());

        balance = balance.plus(transaction.value);
      }

      // if (daySent.gt(0)) daySent = daySent.minus(dayReceived);

      data.push({
        name: day,
        Received: dayReceived.toString() + ' ' + account.coin.symbol,
        Sent: daySent.gt(0)
          ? daySent.toString() + ' ' + account.coin.symbol
          : undefined,
        Balance: balance.toString(),
        'Balance ': 'U$ ' + satoshiToUSD(BTCToSatoshi(balance.toString())),
      });
    }

    data.push({
      name: 'Final balance',
      Balance: balance.toString(),
      'Balance ': 'U$ ' + satoshiToUSD(BTCToSatoshi(balance.toString())),
    });

    return (
      <ResponsiveContainer width="98%" height={320}>
        <ComposedChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <Tooltip formatter={tooltipFormatter} />
          <Line
            strokeWidth={3}
            type="monotoneX"
            dataKey="Balance"
            stroke="#2BAF2B"
            unit={` ${account.coin.symbol}`}
            animationDuration={500}
          />
          <Scatter dataKey="Balance " stackId="a" fill="#2BAF2B" />
          <Scatter dataKey="Received" stackId="a" fill="#2BAF2B" />
          <Scatter dataKey="Sent" stackId="a" fill="#F44336" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }
}
