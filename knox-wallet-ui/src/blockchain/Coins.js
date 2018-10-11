import {
  BITCOIN_P2SH_VERSION,
  BITCOIN_TESTNET_P2SH_VERSION,
  BITCOIN_TESTNET_VERSION,
  BITCOIN_VERSION,
} from '../device/Constants';

import iconBTC from '../media/img/currency-icon-BTC.png';
import iconBTCTestnet from '../media/img/currency-icon-BTC-Testnet.png';

export const coins = {
  BTC: {
    key: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'livenet',
    insightAPI: 'https://search.bitaccess.ca/insight-api',
    blockCypherAPI: 'https://api.blockcypher.com/v1/btc/main',
    coinType: 0, // For BIP 44
    version: BITCOIN_VERSION,
    p2shVersion: BITCOIN_P2SH_VERSION,
    icon: iconBTC,
  },
  BTC_TESTNET: {
    key: 'BTC_TESTNET',
    name: 'Bitcoin Testnet',
    symbol: 'BTC',
    network: 'testnet',
    insightAPI: 'https://test-insight.bitpay.com/api',
    blockCypherAPI: 'https://api.blockcypher.com/v1/btc/test3',
    coinType: 1, // For BIP 44
    version: BITCOIN_TESTNET_VERSION,
    p2shVersion: BITCOIN_TESTNET_P2SH_VERSION,
    icon: iconBTCTestnet,
  },
};
