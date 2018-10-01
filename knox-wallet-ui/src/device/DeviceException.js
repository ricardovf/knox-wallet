export default class DeviceException {
  message = '';
  sw = null;

  constructor(message, sw = null) {
    this.message = message;
    this.sw = sw;
  }

  getSW() {
    return this.sw;
  }

  getMessage() {
    return this.message;
  }

  toString() {
    return this.message + (this.sw ? ` ${this.sw}` : '');
  }
}
