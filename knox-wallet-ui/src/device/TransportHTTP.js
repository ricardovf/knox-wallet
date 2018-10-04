import Transport from './Transport';
import Response from './APDU/Response';
import DeviceException from './DeviceException';
import { Buffer } from 'buffer';
import NoDeviceConnectedException from './NoDeviceConnectedException';

const throwIfNoDevice = response => {
  if (response.status === 405) throw new NoDeviceConnectedException();
  return response;
};

export default class TransportHTTP extends Transport {
  protocol = 'http';
  host = '127.0.0.1';
  port = '28281';

  /**
   * @param command {Buffer}
   * @return {Promise<any>}
   */
  exchange(command) {
    return new Promise((resolve, reject) => {
      try {
        if (this.debug) console.log('SENT =>     ' + command.toString('hex'));
      } catch (e) {
        return reject(new DeviceException('Error making the request: ' + e));
      }

      fetch(`${this.protocol}://${this.host}:${this.port}/call`, {
        method: 'POST',
        body: command.toString('hex'),
      })
        .then(throwIfNoDevice)
        .then(response => response.text())
        .then(data => {
          let bytes = Buffer.from(data, 'hex');

          if (this.debug) console.log('RECEIVED <= ' + bytes.toString('hex'));

          resolve(new Response(bytes));
        })
        .catch(err => {
          reject(
            err instanceof NoDeviceConnectedException
              ? err
              : new DeviceException('Error making the request: ' + err)
          );
        });
    });
  }

  /**
   * @return {Promise<boolean>}
   */
  ping() {
    return new Promise((resolve, reject) => {
      if (this.debug) console.log('SENT =>     ' + '/ping');

      fetch(`${this.protocol}://${this.host}:${this.port}/ping`)
        .then(response => response.text())
        .then(data => {
          if (this.debug) console.log('RECEIVED <= ' + data);

          resolve(data === 'PONG');
        })
        .catch(err => {
          reject(
            new DeviceException(
              'Error sending ping() to transport layer: ' + err
            )
          );
        });
    });
  }

  /**
   * @return {Promise<boolean>}
   */
  reset() {
    return new Promise((resolve, reject) => {
      if (this.debug) console.log('SENT =>     ' + '/reset');

      fetch(`${this.protocol}://${this.host}:${this.port}/reset`)
        .then(throwIfNoDevice)
        .then(response => response.text())
        .then(data => {
          if (this.debug) console.log('RECEIVED <= ' + data);

          resolve(data === 'OK');
        })
        .catch(err => {
          reject(
            err instanceof NoDeviceConnectedException
              ? err
              : new DeviceException(
                  'Error sending reset() to transport layer: ' + err
                )
          );
        });
    });
  }

  /**
   * @return {Promise<boolean>}
   */
  hasDevice() {
    return new Promise((resolve, reject) => {
      if (this.debug) console.log('SENT =>     ' + '/has-device');

      fetch(`${this.protocol}://${this.host}:${this.port}/has-device`)
        .then(response => response.text())
        .then(data => {
          if (this.debug) console.log('RECEIVED <= ' + data);

          resolve(data === '1');
        })
        .catch(err => {
          reject(
            new DeviceException(
              'Error sending has-device() to transport layer: ' + err
            )
          );
        });
    });
  }

  /**
   * @return {Promise<boolean>}
   */
  connectDevice() {
    return new Promise((resolve, reject) => {
      if (this.debug) console.log('SENT =>     ' + '/connect-device');

      fetch(`${this.protocol}://${this.host}:${this.port}/connect-device`)
        .then(response => response.text())
        .then(data => {
          if (this.debug) console.log('RECEIVED <= ' + data);

          resolve(data === 'OK');
        })
        .catch(err => {
          reject(
            new DeviceException(
              'Error sending connect-device() to transport layer: ' + err
            )
          );
        });
    });
  }

  /**
   * @return {Promise<boolean>}
   */
  disconnectDevice() {
    return new Promise((resolve, reject) => {
      if (this.debug) console.log('SENT =>     ' + '/disconnect-device');

      fetch(`${this.protocol}://${this.host}:${this.port}/disconnect-device`)
        .then(response => response.text())
        .then(data => {
          if (this.debug) console.log('RECEIVED <= ' + data);

          resolve(data === 'OK');
        })
        .catch(err => {
          reject(
            new DeviceException(
              'Error sending disconnect-device() to transport layer: ' + err
            )
          );
        });
    });
  }
}
