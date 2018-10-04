export default class Transport {
  debug = false;

  constructor(debug = false) {
    this.debug = debug;
  }

  /**
   * @param command
   * @return {Promise<any>}
   */
  exchange(command) {}

  /**
   * @return {Promise<boolean>}
   */
  ping() {}

  /**
   * @return {Promise<boolean>}
   */
  reset() {}

  /**
   * @return {Promise<boolean>}
   */
  hasDevice() {}

  /**
   * @return {Promise<boolean>}
   */
  connectDevice() {}

  /**
   * @return {Promise<boolean>}
   */
  disconnectDevice() {}

  close() {}
  setDebug(debug) {
    this.debug = debug;
  }
}
