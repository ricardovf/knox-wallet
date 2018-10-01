import Transport from './Transport';
import Response from './APDU/Response';
import DeviceException from './DeviceException';
import { Buffer } from 'buffer';

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
        reject(new DeviceException('Error making the request: ' + e));
      }
      fetch(`${this.protocol}://${this.host}:${this.port}/call`, {
        method: 'POST',
        body: command.toString('hex'),
      })
        .then(response => response.text())
        .then(data => {
          let bytes = Buffer.from(data, 'hex');

          if (this.debug) console.log('RECEIVED <= ' + bytes.toString('hex'));

          resolve(new Response(bytes));
        })
        .catch(err => {
          reject(new DeviceException('Error making the request: ' + err));
        });
    });
  }

  /**
   * @return {Promise<any>}
   */
  ping() {
    return new Promise((resolve, reject) => {
      if (this.debug) console.log('SENT =>     ' + '/ping');

      fetch(`${this.protocol}://${this.host}:${this.port}/ping`)
        .then(response => response.text())
        .then(data => {
          if (this.debug) console.log('RECEIVED <= ' + data);

          resolve(data);
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
   * @return {Promise<any>}
   */
  reset() {
    return new Promise((resolve, reject) => {
      if (this.debug) console.log('SENT =>     ' + '/reset');

      fetch(`${this.protocol}://${this.host}:${this.port}/reset`)
        .then(response => response.text())
        .then(data => {
          if (this.debug) console.log('RECEIVED <= ' + data);

          resolve(data);
        })
        .catch(err => {
          reject(
            new DeviceException(
              'Error sending reset() to transport layer: ' + err
            )
          );
        });
    });
  }
}
