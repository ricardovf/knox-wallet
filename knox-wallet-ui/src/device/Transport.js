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
   * @return {Promise<any>}
   */
  ping() {}

  /**
   * @return {Promise<any>}
   */
  reset() {}

  close() {}
  setDebug(debug) {
    this.debug = debug;
  }
}
