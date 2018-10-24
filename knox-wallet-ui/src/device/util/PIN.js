import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from '../Constants';

export function isValidPinLength(pin) {
  if (
    pin == null ||
    pin.length < PIN_MIN_LENGTH ||
    pin.length > PIN_MAX_LENGTH
  ) {
    return false;
  }

  return true;
}

export function isValidPinContent(pin) {
  if (!isValidPinLength(pin) || !/^\d+$/g.test(pin)) {
    return false;
  }

  return true;
}

export function isValidPin(pin) {
  return isValidPinContent(pin);
}
