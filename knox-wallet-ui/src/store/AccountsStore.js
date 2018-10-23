import { observable, computed, action, autorun, runInAction } from 'mobx';
import BitcoinAPI from '../blockchain/bitcoin/BitcoinAPI';
import { task } from 'mobx-task';
import { coins } from '../blockchain/Coins';
import { Converter } from '../blockchain/Converter';
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
import { asyncComputed } from 'computed-async-mobx';
import { COIN_SELECTION_ALL } from './AppStore';

const bitcoinAPI = new BitcoinInsightAPI();

export default class AccountsStore {
  @observable
  id = null; // @todo put unique id for current seed that will be used to store accounts on local storage

  @observable.shallow
  coins = coins;

  _currentUSDRate = asyncComputed(undefined, 60000, async () => {
    try {
      return await fetch('http://api.coindesk.com/v1/bpi/currentprice/USD.json')
        .then(response => response.json())
        .then(data => {
          Converter.currentUSDRate = data.bpi.USD.rate_float;
          return Converter.currentUSDRate;
        });
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  });

  @computed
  get currentUSDRate() {
    return this._currentUSDRate.get();
  }

  @observable
  accounts = new Map();

  constructor(appStore) {
    this.appStore = appStore;
    this.deviceStore = appStore.deviceStore;
    this._refreshAccountsInterval = null;

    this._currentUSDRate.refresh();
  }

  @computed
  get canAddNewAccount() {
    if (this.appStore.selectedCoin !== COIN_SELECTION_ALL) {
      for (let accountIndex of [...this.accounts.keys()]) {
        let account = this.accounts.get(accountIndex);

        if (
          account.coin.key === this.appStore.selectedCoin &&
          account.addresses.size === 0
        ) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  @action.bound
  newAccount(coinKey) {
    let coin = coins[coinKey];

    if (!coin) return false;

    // Discover the next account index
    let maxIndex = 0;
    for (let accountIndex of [...this.accounts.keys()]) {
      let account = this.accounts.get(accountIndex);

      if (account.coin.key === coin.key && account.index >= maxIndex)
        maxIndex = account.index + 1;
    }

    let account = new Account();
    account.coin = coin;
    account.index = maxIndex;
    account.name = `Account ${parseInt(maxIndex, 10) + 1}`;
    account.purpose = DEFAULT_PURPOSE;

    this.accounts.set(account.getIdentifier(), account);

    return true;
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

  addFreshAddress = task(
    async () => {
      let account = this.accounts.get(this.appStore.selectedAccount);

      if (account) {
        // lets generate an address and add it to the account
        let nextFreshIndex =
          account.addresses.size > 0
            ? Math.max(...account.addresses.keys()) + 1
            : 0;

        // Make sure the coin is correct on the device
        await this.deviceStore.device.changeNetwork(
          account.coin.version,
          account.coin.p2shVersion
        );

        let address = new Address();
        address.index = nextFreshIndex;
        address.path = `${account.purpose}'/${account.coin.coinType}'/${
          account.index
        }'/0/${nextFreshIndex}`;
        address.internal = false;
        address.address = await this.deviceStore.device.getAddress(
          address.path
        );

        if (!account.addresses.has(address.index)) {
          runInAction(() => {
            account.addresses.set(address.index, address);
          });
        }

        // this._forceAddressesRefresh();
        return true;
      }

      return false;
    },
    { state: undefined }
  );

  loadTransactions = task(
    async () => {
      for (let accountIndex of [...this.accounts.keys()]) {
        let account = this.accounts.get(accountIndex);
        for (let transactionId of [...account.transactions.keys()]) {
          let transaction = account.transactions.get(transactionId);

          if (!transaction.loaded) {
            let info = await bitcoinAPI._transactionDetails(transaction.id);

            runInAction(() => {
              transaction.data = info;
              transaction.confirmations = info.confirmations;
              transaction.valueIn = info.valueIn;
              transaction.valueOut = info.valueOut;
              transaction.fees = info.fees;
              transaction.time = moment.unix(info.time);
              transaction.loaded = true;
            });
          }
        }
      }

      return true;
    },
    { state: undefined }
  );

  loadAddresses = task(
    async () => {
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
            runInAction(() => {
              for (let transactionId of info.transactions) {
                let transaction = new Transaction(transactionId);

                if (!account.transactions.has(transaction.id)) {
                  account.transactions.set(transaction.id, transaction);
                }
              }
            });
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

      this._forceAddressesRefresh();

      return true;
    },
    { state: undefined }
  );
}
