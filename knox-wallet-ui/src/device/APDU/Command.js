/*
CASE    COMMAND     RESPONSE
1       NO DATA     NO DATA
2       DATA        NO DATA
3       NO DATA     DATA
4       DATA        DATA
*/

import ByteUtil from '../util/ByteUtil';
import { Buffer } from 'buffer';

export default class Command {
  constructor(obj) {
    if (obj.bytes) {
      this.bytes = obj.bytes;
    } else {
      let size = obj.size;
      let cla = obj.cla;
      let ins = obj.ins;
      let p1 = obj.p1;
      let p2 = obj.p2;
      let data = obj.data;
      let le = obj.le || 0;
      let lc;

      // case 1
      if (!size && !data && !le) {
        //le = -1;
        //console.info('case 1');
        size = 4;
      }
      // case 2
      else if (!size && !data) {
        //console.info('case 2');
        size = 4 + 2;
      }

      // case 3
      else if (!size && !le) {
        //console.info('case 3');
        size = data.length + 5 + 4;
        //le = -1;
      }

      // case 4
      else if (!size) {
        //console.info('case 4');
        size = data.length + 5 + 4;
      }

      // set data
      if (data) {
        lc = data.length;
      } else {
        //lc = 0;
      }

      this.bytes = [];
      this.bytes.push(cla);
      this.bytes.push(ins);
      this.bytes.push(p1);
      this.bytes.push(p2);

      if (data) {
        this.bytes.push(lc);
        this.bytes = this.bytes.concat(data);
      }
      this.bytes.push(le);
    }
  }

  //    static build(command, data) {
  //       let apdu = new Buffer(command.length + data.length + 1);
  //       apdu.write(data, 0);
  //       apdu[command.length] = (byte) data.length;
  //       System.arraycopy(data, 0, apdu, command.length + 1, data.length);
  //       return apdu;
  //     }
  //
  //  static build( cla,  ins,  p1,  p2, data, acceptedSW) {
  //   let apdu = new Buffer(data.length + 5);
  //   apdu[0] = cla;
  //   apdu[1] = ins;
  //   apdu[2] = p1;
  //   apdu[3] = p2;
  //    apdu.writeUInt8(data.length, 4);
  //    data.copy(apdu, 5);
  //   return apdu;
  // }

  toString() {
    return ByteUtil.toHexString(this.bytes);
  }

  toByteArray() {
    return this.bytes;
  }

  setLe(le) {
    this.bytes.pop();
    this.bytes.push(le);
  }
}
