import moment from 'moment';
import { satoshiToBTC, satoshiToUSD } from './Converter';

export default class Transaction {
  id = null;
  data = {};
  loaded = false;

  confirmations = 0;
  valueIn = 0;
  valueOut = 0;
  fees = 0;
  time = 0;

  constructor(id) {
    this.id = id;
  }

  // get balanceBTC() {
  //   return satoshiToBTC(this.balance);
  // }
  //
  // get balanceUSD() {
  //   return satoshiToUSD(this.balance);
  // }
}
