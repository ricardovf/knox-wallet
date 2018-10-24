import BitcoinAPI from './BitcoinAPI';
import bigInt from 'big-integer';

export const DEFAULT_GAP_LIMIT = 20;
export const DEFAULT_PURPOSE = 44;

export default class AccountDiscovery {
  static GAP_LIMIT = DEFAULT_GAP_LIMIT;
  /**
   * @param addressDerive
   * @param API
   * @param coin
   * @param purpose
   * @param internal
   * @param initialAccount
   * @param initialIndex
   * @return {Promise<any>}
   */
  static async discover(
    addressDerive,
    API,
    coin,
    purpose = DEFAULT_PURPOSE,
    internal = false,
    initialAccount = 0,
    initialIndex = 0
  ) {
    /**
     * 1. derive the first account's node (index = 0)
     * 2. derive the external chain node of this account
     * 3. scan addresses of the external chain; respect the gap limit described below
     * 4. if no transactions are found on the external chain, stop discovery
     * 5. if there are some transactions, increase the account index and go to step 1
     */
    return new Promise(async (resolve, reject) => {
      if (!addressDerive) return reject('Invalid addressDerive function');
      if (!API instanceof BitcoinAPI)
        return reject('bitcoinAPI must be an instance of bitcoinAPI');

      let accountsFound = {};

      // m / purpose' / coin_type' / account' / change / address_index
      let coin_type = coin.coinType;
      let account = initialAccount;
      let address_index = initialIndex;

      let currentGap = 0;
      do {
        let path = `${purpose}'/${coin_type}'/${account}'/${
          internal ? 1 : 0
        }/${address_index}`;
        let address = await addressDerive(path);
        let addressInfo;

        try {
          // Example: https://test-insight.bitpay.com/api/addr/mkWwBRoFVYr8xQci3tr8VteayMYLKBhcxG
          API.setEndPoint(coin.insightAPI);
          addressInfo = await API.addressInfo(address);
          console.log(path, addressInfo);
        } catch (e) {
          addressInfo = null;
        }

        if (
          addressInfo &&
          Array.isArray(addressInfo.transactions) &&
          addressInfo.transactions.length > 0
        ) {
          accountsFound[account] = accountsFound[account] || {};
          accountsFound[account][address_index] = {
            address,
            path,
            internal,
            ...addressInfo,
          };
        } else {
          currentGap++;
        }

        address_index++;

        // If we reached the gap limit but we had found valid addresses in this account, lets check the next account
        if (
          currentGap === this.GAP_LIMIT - 1 &&
          accountsFound[account] !== undefined
        ) {
          account++;
          address_index = 0;
          currentGap = 0;
        }
      } while (currentGap < this.GAP_LIMIT);

      return resolve(accountsFound);
    });
  }
}
