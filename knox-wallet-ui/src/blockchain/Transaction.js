import moment from 'moment';

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
}
