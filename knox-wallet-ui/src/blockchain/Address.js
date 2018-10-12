import { satoshiToBTC, satoshiToUSD } from './Converter';

export default class Address {
  path = '';
  index = null;
  address = '';
  internal = false;

  //
  balance = 0;
  unconfirmedBalance = 0;
  totalReceived = 0;
  totalSent = 0;
  transactions = new Map();

  //
  lastUpdate = null;

  get balanceBTC() {
    return satoshiToBTC(this.balance);
  }

  get balanceUSD() {
    return satoshiToUSD(this.balance);
  }
}
