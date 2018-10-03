export default class ByteUtil {
  static toByteArray(hexStr) {
    let hex = [];
    let arr = hexStr.match(/[0-9a-fA-F]{2}/g);
    arr.forEach(function(h) {
      hex.push(parseInt(h, 16));
    });
    return hex;
  }
}
