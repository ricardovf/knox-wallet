import { Big } from 'big.js';
import { toFormat } from './toFormat';

Big.NE = -21;

export const Converter = {
  currentUSDRate: 0,
};

export function satoshiToBTC(satoshi, returnString = true) {
  let n;
  try {
    n = new Big(satoshi);

    n = n.div(new Big(100000000));
  } catch (e) {
    n = new Big(0);
  }

  return returnString ? n.toString() : n;
}

export function BTCToSatoshi(btc, returnString = true) {
  let n;
  try {
    n = new Big(btc);

    n = n.times(new Big(100000000));
  } catch (e) {
    n = new Big(0);
  }
  return returnString ? n.toString() : n;
}

export function BTCToUSD(btc, returnString = true, precision = 2) {
  let n;

  try {
    n = new Big(btc).times(Converter.currentUSDRate);
  } catch (e) {
    n = new Big(0);
  }

  return returnString ? toFormat(n, precision, 1) : n;
}

export function satoshiToUSD(satoshi, returnString = true, precision = 2) {
  let n = satoshiToBTC(satoshi, false).times(Converter.currentUSDRate);

  return returnString ? toFormat(n, precision, 1) : n;
}
