import moment from 'moment';
import { BTCToSatoshi, satoshiToUSD } from './Converter';
import * as R from 'ramda';
import { observable } from 'mobx';
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

  @observable
  raw = '';

  constructor(id) {
    this.id = id;
  }

  get isConfirmed() {
    return this.confirmations > 1;
  }

  static getReceivedByDay(
    transactions,
    accountAddresses,
    accountAddressesInternal
  ) {
    let accountAddressesAll = [
      ...accountAddresses,
      ...accountAddressesInternal,
    ];

    let byDay = [];
    // group transactions by day
    for (let transaction of transactions) {
      let obj = {
        id: transaction.id,
        timestamp: transaction.time.unix(),
        day: transaction.time.format('MMM D, YYYY'),
        hour: transaction.time.format('h:mm A'),
        confirmations: transaction.confirmations,
        confirmed: transaction.isConfirmed,
        fees: transaction.fees,
      };

      // Find input values (sent)
      if (Array.isArray(transaction.data.vin)) {
        for (let inTx of transaction.data.vin) {
          if (accountAddressesAll.includes(inTx.addr)) {
            let value = new Big(inTx.value).times(-1);
            byDay.push({
              ...obj,
              address: inTx.addr,
              isInternalAddress: accountAddressesInternal.includes(inTx.addr),
              value: value,
              valueBTC: value.toString(),
              valueUSD: satoshiToUSD(BTCToSatoshi(value.toString())),
            });
          }
        }
      }

      // Find output values (received)
      if (Array.isArray(transaction.data.vout)) {
        for (let outTx of transaction.data.vout) {
          if (
            outTx.scriptPubKey &&
            Array.isArray(outTx.scriptPubKey.addresses)
          ) {
            for (let outTxAddress of outTx.scriptPubKey.addresses) {
              if (accountAddressesAll.includes(outTxAddress)) {
                let value = new Big(outTx.value);
                byDay.push({
                  ...obj,
                  address: outTxAddress,
                  isInternalAddress: accountAddressesInternal.includes(
                    outTxAddress
                  ),
                  value: value,
                  valueBTC: value.toString(),
                  valueUSD: satoshiToUSD(BTCToSatoshi(value.toString())),
                });
              }
            }
          }
        }
      }
    }

    // Sort
    byDay = R.sortWith([R.descend(R.prop('timestamp'))])(byDay);

    // Group
    byDay = R.groupBy(t => t.day)(byDay);

    // console.log(byDay);

    return byDay;
  }
}
