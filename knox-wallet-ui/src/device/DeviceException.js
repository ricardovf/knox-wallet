export default class DeviceException extends Error {
  sw = null;

  constructor(message, sw = null) {
    super(message);
    this.sw = sw;
  }

  getSW() {
    return this.sw;
  }

  toString() {
    return this.message + (this.sw ? ` ${this.sw}` : '');
  }
}
