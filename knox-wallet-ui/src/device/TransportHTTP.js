import Transport from './Transport';
import Response from './APDU/Response';
import { runInAction } from 'mobx';
import DeviceException from './DeviceException';
import ByteUtil from './util/ByteUtil';

export default class TransportHTTP extends Transport {
  protocol = 'http';
  host = '127.0.0.1';
  port = '28281';

  /**
   * @param command
   * @return {Promise<any>}
   */
  exchange(command) {
    return new Promise((resolve, reject) => {
      try {
        if (this.debug)
          console.log('SENT =>     ' + ByteUtil.toHexString(command));
      } catch (e) {
        reject(new DeviceException('Error making the request: ' + e));
      }
      fetch(`${this.protocol}://${this.host}:${this.port}/call`, {
        method: 'POST',
        body: ByteUtil.toHexString(command),
      })
        .then(response => response.text())
        .then(data => {
          let bytes = ByteUtil.toByteArray(data);

          if (this.debug)
            console.log('RECEIVED <= ' + ByteUtil.toHexString(bytes));

          resolve(new Response(bytes));
        })
        .catch(err => {
          reject(new DeviceException('Error making the request: ' + err));
        });
    });
  }
}
