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
  close() {}
  setDebug(debug) {
    this.debug = debug;
  }
}
