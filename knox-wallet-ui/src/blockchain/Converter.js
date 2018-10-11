import { Big } from 'big.js';

export function satoshiToBTC(satoshi, returnString = true) {
  let n = new Big(satoshi);

  n = n.div(new Big(100000000));

  return returnString ? n.toString() : n;
}

export function BTCToSatoshi(btc, returnString = true) {
  let n = new Big(btc);

  n = n.times(new Big(100000000));

  return returnString ? n.toString() : n;
}

export function satoshiToUSD(satoshi, returnString = true, precision = 2) {
  let n = satoshiToBTC(satoshi, false).times(6200);
  return returnString ? n.toFixed(precision) : n;
}
