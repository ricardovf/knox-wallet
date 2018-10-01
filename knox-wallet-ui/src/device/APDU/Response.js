import { Buffer } from 'buffer';
import DeviceException from '../DeviceException';

export const statusCodes = {
  '^9000$': 'Normal processing',
  '^61(.{2})$':
    'Normal processing, (sw2 indicates the number of response bytes still available)',
  '^62(.{2})$': 'Warning processing',
  '^6200$': 'no info',
  '^6281$': 'Part of return data may be corrupted',
  '^6282$': 'end of file/record reached before reading le bytes',
  '^6283$': 'ret data may contain structural info',
  '^6284$': 'selected file is invalidated',
  '^6285$': 'file control info not in required format',
  '^6286$': 'unsuccessful writing',
  '^63(.{2})$': 'Warning processing',
  '^6300$': 'no info',
  '^6381$': 'last write filled up file',
  '^6382$': 'execution successful after retry',
  //          c0	least significant nibble is a counter....
  //          ..	..valued from 0 to 15
  //          cf
  '^64(.{2})$': 'Execution error',
  '^65(.{2})$': 'Execution error',
  '^6500$': 'no info',
  '^6581$': 'memory failure',
  '^66(.{2})$': 'Reserved for future use',
  '^6700$': 'Wrong length',
  '^68(.{2})$': 'Checking error: functions in CLA not supported (see sw2)',
  '^6800$': 'no info',
  '^6881$': 'logical channel not supported',
  '^6882$': 'secure messaging not supported',
  '^69(.{2})$': 'Checking error: command not allowed (see sw2)',
  '^6a(.{2})$': 'Checking error: wrong parameters (p1 or p2)  (see sw2)',
  '^6b(.{2})$': 'Checking error: wrong parameters',
  '^6c(.{2})$':
    'Checking error: wrong length (sw2 indicates correct length for le)',
  '^6d(.{2})$': 'Checking error: wrong ins',
  '^6e(.{2})$': 'Checking error: class not supported',
  '^6f(.{2})$': 'Checking error: no precise diagnosis',
};

export function statusWordToMessage(statusCode) {
  let buf = new Buffer(2);
  buf.writeUInt16BE(statusCode, 0);
  statusCode = buf.toString('hex');

  for (let prop in statusCodes) {
    if (statusCodes.hasOwnProperty(prop)) {
      let result = statusCodes[prop];
      if (statusCode.match(prop)) {
        return result;
      }
    }
  }
  return 'Unknown';
}

export default class Response {
  /**
   * @param buffer {Buffer}
   */
  constructor(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new DeviceException('Data must be a Buffer object');
    }
    this.buffer = buffer;
  }

  /**
   * @return {number}
   */
  getStatusCode() {
    return (
      ((this.buffer[this.buffer.length - 2] & 0xff) << 8) |
      (this.buffer[this.buffer.length - 1] & 0xff)
    );
  }

  /**
   * @return {Buffer}
   */
  getBuffer() {
    return this.buffer;
  }

  toString() {
    return this.buffer.toString('hex');
  }
}
