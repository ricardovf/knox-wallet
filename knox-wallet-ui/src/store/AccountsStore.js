import { observable, computed, action, autorun, runInAction } from 'mobx';
import BitcoinAPI from '../blockchain/bitcoin/BitcoinAPI';
import { task } from 'mobx-task';
import { coins } from '../blockchain/Coins';
import BitcoinInsightAPI from '../blockchain/bitcoin/BitcoinInsightAPI';
import AccountDiscovery, {
  DEFAULT_PURPOSE,
} from '../blockchain/bitcoin/AccountDiscovery';
import { __DEV__ } from '../Util';
import * as R from 'ramda';
import Address from '../blockchain/Address';
import Account from '../blockchain/Account';
import * as mobx from 'mobx';
import Transaction from '../blockchain/Transaction';
import moment from 'moment';

const bitcoinAPI = new BitcoinInsightAPI();

export default class AccountsStore {
  @observable
  id = null; // @todo put unique id for current seed that will be used to store accounts on local storage

  @observable.shallow
  coins = coins;

  @observable
  accounts = new Map();

  constructor(appStore) {
    this.appStore = appStore;
    this.deviceStore = appStore.deviceStore;
    this._refreshAccountsInterval = null;
  }

  @action
  autoRefreshAccountsStart() {
    if (this._refreshAccountsInterval === null) {
      this._forceAccountsRefresh();
      this._refreshAccountsInterval = setInterval(
        this._forceAccountsRefresh,
        60000 * 5 // 5 minutes
      );
    }
  }

  @action
  autoRefreshAccountsStop() {
    if (this._refreshAccountsInterval !== null) {
      clearInterval(this._refreshAccountsInterval);
      this._refreshAccountsInterval = null;
    }
  }

  _forceAccountsRefresh = () => {
    if (this.loadAccounts.result === undefined || !this.loadAccounts.pending)
      this.loadAccounts();
  };

  _forceAddressesRefresh() {
    if (this.loadAddresses.result === undefined || !this.loadAddresses.pending)
      this.loadAddresses();
  }

  _forceTransactionsRefresh() {
    if (
      this.loadTransactions.result === undefined ||
      !this.loadTransactions.pending
    )
      this.loadTransactions();
  }

  loadTransactions = task(
    async () => {
      console.log('loadTransactions!');
      for (let accountIndex of [...this.accounts.keys()]) {
        let account = this.accounts.get(accountIndex);
        for (let transactionId of [...account.transactions.keys()]) {
          let transaction = account.transactions.get(transactionId);

          if (!transaction.loaded) {
            let info = await bitcoinAPI._transactionDetails(transaction.id);

            transaction.data = info;
            transaction.confirmations = info.confirmations;
            transaction.valueIn = info.valueIn;
            transaction.valueOut = info.valueOut;
            transaction.fees = info.fees;
            transaction.time = moment(info.time);
            transaction.loaded = true;
          }
        }
      }

      return true;
    },
    { state: undefined }
  );

  loadAddresses = task(
    async () => {
      console.log('loadAddresses!');
      for (let accountIndex of [...this.accounts.keys()]) {
        let account = this.accounts.get(accountIndex);
        for (let addressIndex of [...account.addresses.keys()]) {
          let address = account.addresses.get(addressIndex);

          // @todo only update if forceUpdateOfAddresses.lenght > 0 && addr is in forceUpdateOfAddresses
          let info = await bitcoinAPI.addressInfo(address.address);

          address.balance = info.balanceSat;
          address.totalReceived = info.totalReceivedSat;
          address.totalSent = info.totalSentSat;
          address.unconfirmedBalance = info.unconfirmedBalanceSat;

          address.lastUpdate = new Date();

          if (Array.isArray(info.transactions) && info.transactions.length) {
            for (let transactionId of info.transactions) {
              let transaction = new Transaction(transactionId);

              if (!account.transactions.has(transaction.id)) {
                account.transactions.set(transaction.id, transaction);
              }
            }
          }
        }

        account.updateBalance();
      }

      return true;
    },
    { state: undefined }
  );

  loadAccounts = task(
    async () => {
      console.log('loadAccounts!');
      for (let coin of R.values(this.coins)) {
        bitcoinAPI.endpoint = coin.insightAPI;
        let accounts = {};
        try {
          // make sure we are in correct network
          await this.deviceStore.device.changeNetwork(
            coin.version,
            coin.p2shVersion
          );

          if (__DEV__) AccountDiscovery.GAP_LIMIT = 5;

          // @todo init from current account

          accounts = await AccountDiscovery.discover(
            this.deviceStore.device.getAddress.bind(this.deviceStore.device),
            bitcoinAPI,
            coin
          );

          runInAction(() => {
            R.forEachObjIndexed((accountAddresses, accountIndex) => {
              let account = new Account();
              account.coin = coin;
              account.index = accountIndex;
              account.name = `Account ${parseInt(accountIndex, 10) + 1}`;
              account.purpose = DEFAULT_PURPOSE;

              if (!this.accounts.has(account.getIdentifier())) {
                this.accounts.set(account.getIdentifier(), account);
              } else {
                account = this.accounts.get(account.getIdentifier());
              }

              R.forEachObjIndexed((addressInfo, addressIndex) => {
                let address = new Address();
                address.index = addressIndex;
                address.address = addressInfo.address;
                address.path = addressInfo.path;
                address.internal = false;

                if (!account.addresses.has(addressIndex)) {
                  account.addresses.set(addressIndex, address);
                }
              }, accountAddresses);
            }, accounts);
          });
        } catch (e) {
          // @todo display error to user
          return false;
        }
      }

      console.log(this.accounts.toJSON());
      this._forceAddressesRefresh();

      return true;
    },
    { state: undefined }
  );
}
