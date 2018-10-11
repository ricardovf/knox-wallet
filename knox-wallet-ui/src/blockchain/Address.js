export default class Address {
  path = null;
  index = null;
  address = null;
  internal = false;

  //
  balance = 0;
  unconfirmedBalance = 0;
  totalReceived = 0;
  totalSent = 0;
  transactions = new Map();

  //
  lastUpdate = null;
}
