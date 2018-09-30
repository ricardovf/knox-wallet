export default class ByteUtil {
  static toByteArray(hexStr) {
    let hex = [];
    let arr = hexStr.match(/[0-9a-fA-F]{2}/g);
    arr.forEach(function(h) {
      hex.push(parseInt(h, 16));
    });
    return hex;
  }

  static toHexString(byteArray) {
    if (!Array.isArray(byteArray)) byteArray = [byteArray];
    let str = '';
    byteArray.forEach(function(b) {
      let hex = b.toString(16);
      str += hex.length < 2 ? '0' + hex : hex;
    });
    return str;
  }

  static stringToByteArray(str) {
    let bytes = [];
    for (let i = 0; i < str.length; i++) {
      let char = str.charCodeAt(i);
      bytes.push(char >>> 8);
      bytes.push(char & 0xff);
    }
    return bytes;
  }
}
