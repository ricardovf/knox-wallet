import moment from 'moment';
import { BTCToSatoshi, satoshiToBTC, satoshiToUSD } from './Converter';
import * as R from 'ramda';
import { observable, values } from 'mobx';
import { Big } from 'big.js';

export default class Transaction {
  id = null;

  @observable.shallow
  data = {};

  @observable
  loaded = false;

  @observable
  confirmations = 0;

  @observable
  valueIn = 0;

  @observable
  valueOut = 0;

  @observable
  fees = 0;

  @observable
  time = moment();

  constructor(id) {
    this.id = id;
  }

  get isConfirmed() {
    return this.confirmations > 2;
  }

  static getReceivedByDay(transactions, accountAddresses) {
    let byDay = new Map();
    // group transactions by day
    for (let transaction of transactions) {
      if (Array.isArray(transaction.data.vout)) {
        let addresses = R.flatten(
          R.map(R.path(['scriptPubKey', 'addresses']), transaction.data.vout)
        );

        if (
          Array.isArray(addresses) &&
          R.intersection(addresses, accountAddresses).length > 0
        ) {
          if (moment.isMoment(transaction.time)) {
            let day = transaction.time.format('MMM D, YYYY');

            // Sum the outputs values
            let validOutputs = R.filter(
              t =>
                R.intersection(t.scriptPubKey.addresses, accountAddresses)
                  .length > 0,
              transaction.data.vout
            );

            console.log(validOutputs);

            let balance = new Big(0);
            R.forEach(o => (balance = balance.plus(o.value)), validOutputs);

            console.log(balance.toString());

            let obj = {
              id: transaction.id,
              day: day,
              hour: transaction.time.format('h:mm A'),
              confirmations: transaction.confirmations,
              confirmed: transaction.isConfirmed,
              fees: transaction.fees,
              balance: balance,
              balanceBTC: balance.toString(),
              balanceUSD: satoshiToUSD(BTCToSatoshi(balance.toString())),
              address: R.intersection(addresses, accountAddresses).join(', '),
            };

            if (!byDay.has(day)) byDay.set(day, []);

            byDay.get(day).push(obj);
          }
        }
      }
    }

    // sort by date the days and the inner transactions
    return byDay;
  }
}
