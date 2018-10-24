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
  transactionsIds = [];

  get balanceBTC() {
    return satoshiToBTC(this.balance + this.unconfirmedBalance);
  }

  get balanceUSD() {
    return satoshiToUSD(this.balance + this.unconfirmedBalance);
  }

  get hasAnyTransaction() {
    return this.transactionsIds && this.transactionsIds.length > 0;
  }

  get hasUnconfirmedBalance() {
    return this.unconfirmedBalance > 0;
  }

  updateValues(
    balanceSat,
    unconfirmedBalanceSat,
    totalReceivedSat,
    totalSentSat
  ) {
    this.balance = balanceSat;
    this.unconfirmedBalance = unconfirmedBalanceSat;
    this.totalReceived = totalReceivedSat;
    this.totalSent = totalSentSat;
  }
}
