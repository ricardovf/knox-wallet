import SecureDevice from '../../../device/SecureDevice';
import TransportHTTP from '../../../device/TransportHTTP';
import {
  BITCOIN_TESTNET_P2SH_VERSION,
  BITCOIN_TESTNET_VERSION,
  MODE_DEVELOPMENT,
} from '../../../device/Constants';
import {
  DEFAULT_PIN,
  DEFAULT_SEED,
} from '../../../device/__tests__/SecureDevice.test';
import AccountDiscovery from '../AccountDiscovery';
import { coins } from '../../Coins';
import BitcoinInsightAPI from '../BitcoinInsightAPI';

it(
  'can get discover the accounts',
  async done => {
    let device = new SecureDevice(new TransportHTTP(false));
    await device.transport.reset();
    await device.transport.connectDevice();
    await device.setup(
      MODE_DEVELOPMENT,
      BITCOIN_TESTNET_VERSION,
      BITCOIN_TESTNET_P2SH_VERSION,
      DEFAULT_PIN,
      DEFAULT_SEED
    );

    await device.verifyPin(DEFAULT_PIN);

    let addressDerive = device.getAddress.bind(device);

    let bitcoinAPI = new BitcoinInsightAPI(coins.BTC_TESTNET.insightAPI);

    let accounts;

    try {
      AccountDiscovery.GAP_LIMIT = 5;

      accounts = await AccountDiscovery.discover(
        addressDerive,
        bitcoinAPI,
        coins.BTC_TESTNET
      );
    } catch (e) {}

    expect(accounts[0]).not.toBeUndefined();
    expect(accounts[0][0]).toEqual({
      address: 'mkWwBRoFVYr8xQci3tr8VteayMYLKBhcxG',
      path: "44'/1'/0'/0/0",
      totalReceived: '20491517',
    });

    done();
  },
  60000 // 60 seconds timeout
);
