export default class NoDeviceConnectedException extends Error {
  constructor() {
    super('No device connected!');
  }
}
