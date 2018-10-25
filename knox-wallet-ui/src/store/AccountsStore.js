import { action, computed, observable, runInAction } from 'mobx';
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
      Converter.currentUSDRate = await bitcoinAPI.currentUSDRate();
      return Converter.currentUSDRate;
    } catch (e) {
      if (__DEV__) console.log(e);
    }
  });

  @computed
  get currentUSDRate() {
    return this._currentUSDRate.get();
  }

  _currentFees = asyncComputed({}, 60000, async () => {
    let fees = {};
    try {
      bitcoinAPI.setEndPoint(coins.BTC_TESTNET.insightAPI);

      for (let blocks of [1, 2, 4, 5, 10])
        fees[blocks] = {
          blocks: blocks,
          feeBTC: await bitcoinAPI.fee(blocks),
          minutes: blocks * 10,
        };
    } catch (e) {
      if (__DEV__) console.log(e);
    }
    return fees;
  });

  @computed
  get currentFees() {
    return this._currentFees.get();
  }

  @observable
  accounts = new Map();

  constructor(appStore) {
    this.appStore = appStore;
    this.deviceStore = appStore.deviceStore;
    this._refreshAccountsInterval = null;

    this._currentUSDRate.refresh();
    this._currentFees.refresh();
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
  sendTransaction() {}

  @action.bound
  newAccount(coinKey) {
    let coin = coins[coinKey];

    if (!coin) return false;

    // Discover the next account index
    let maxIndex = 0;
    for (let accountIndex of [...this.accounts.keys()]) {
      let account = this.accounts.get(accountIndex);

      if (
        account.coin.key === coin.key &&
        parseInt(account.index, 10) >= maxIndex
      )
        maxIndex = parseInt(account.index, 10) + 1;
    }

    let account = new Account();
    account.coin = coin;
    account.index = maxIndex;
    account.name = `Account ${maxIndex + 1}`;
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
        30000 * (__DEV__ ? 10 : 1) // 30 seconds
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

          //if (!transaction.loaded) {
          try {
            bitcoinAPI.setEndPoint(account.coin.insightAPI);
            let info = await bitcoinAPI.transactionDetails(transaction.id);

            runInAction(() => {
              transaction.data = info;
              transaction.confirmations = info.confirmations;
              transaction.valueIn = info.valueIn;
              transaction.valueOut = info.valueOut;
              transaction.fees = info.fees;
              transaction.time = moment.unix(info.time);
              transaction.loaded = true;
            });
          } catch (e) {
            // ignore, the transaction might not yet been propagated
          }
          //}
        }
      }

      return true;
    },
    { state: undefined }
  );

  loadAccounts = task(
    async () => {
      for (let internal of [true, false]) {
        for (let coin of R.values(this.coins)) {
          let accounts = {};
          try {
            // make sure we are in correct network
            await this.deviceStore.device.changeNetwork(
              coin.version,
              coin.p2shVersion
            );

            if (__DEV__) AccountDiscovery.GAP_LIMIT = 2;

            accounts = await AccountDiscovery.discover(
              this.deviceStore.device.getAddress.bind(this.deviceStore.device),
              bitcoinAPI,
              coin,
              DEFAULT_PURPOSE,
              internal
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
                  address.internal = addressInfo.internal;

                  let addresses = internal
                    ? account.addressesInternal
                    : account.addresses;

                  if (!addresses.has(addressIndex))
                    addresses.set(addressIndex, address);
                  else address = addresses.get(addressIndex);

                  address.updateValues(
                    addressInfo.balanceSat,
                    addressInfo.unconfirmedBalanceSat,
                    addressInfo.totalReceivedSat,
                    addressInfo.totalSentSat
                  );

                  if (
                    Array.isArray(addressInfo.transactions) &&
                    addressInfo.transactions.length
                  ) {
                    for (let transactionId of addressInfo.transactions) {
                      let transaction = new Transaction(transactionId);

                      if (!account.transactions.has(transaction.id))
                        account.transactions.set(transaction.id, transaction);
                    }

                    address.transactionsIds = addressInfo.transactions;
                  } else {
                    address.transactionsIds = [];
                  }
                }, accountAddresses);

                account.updateBalance();

                if (!this.loadTransactions.pending) this.loadTransactions();
              }, accounts);
            });
          } catch (e) {
            // @todo display error to user
            return false;
          }
        }
      }

      return true;
    },
    { state: undefined }
  );
}
