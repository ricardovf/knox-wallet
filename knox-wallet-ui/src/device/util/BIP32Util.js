import DeviceException from '../DeviceException';
import bigInt from 'big-integer';
import { Buffer } from 'buffer';

export default class BIP32Util {
  static splitPath(path) {
    if (path.length === 0) {
      return [0x00];
    }
    let elements = path.split('/');
    if (elements.length > 10) {
      throw new DeviceException('Path too long');
    }
    let result = new Buffer(1 + elements.length * 4);
    let offset = 0;
    result.writeUInt8(elements.length, offset++);
    for (let element of elements) {
      let elementValue;
      let hardenedIndex = element.indexOf("'");
      if (hardenedIndex > 0) {
        elementValue = bigInt(element.substring(0, hardenedIndex));
        elementValue.or(0x80000000);
      } else {
        elementValue = bigInt(element);
      }
      result.writeUInt32BE(elementValue.valueOf(), offset);
      offset += 4;
    }
    return result;
  }
}
