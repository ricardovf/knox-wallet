import {
  CLA,
  INS_CHANGE_NETWORK,
  INS_CHANGE_PIN,
  INS_ERASE,
  INS_GET_FIRMWARE_VERSION,
  INS_GET_GENUINENESS_KEY,
  INS_GET_MODE,
  INS_GET_STATE,
  INS_GET_WALLET_PUBLIC_KEY,
  INS_PREPARE_SEED,
  INS_PROVE_GENUINENESS,
  INS_SETUP,
  INS_SIGN_TRANSACTION,
  INS_VALIDATE_SEED_BACKUP,
  INS_VERIFY_PIN,
  MODE_DEVELOPER,
  MODE_WALLET,
  SW_OK,
} from './Constants';
import DeviceException from './DeviceException';
import Command from './APDU/Command';
import BIP32Util from './util/BIP32Util';
import { Buffer } from 'buffer';
import ByteUtil from './util/ByteUtil';

export default class SecureDevice {
  transport = null;
  lastSW = null;

  OK = [SW_OK];
  DUMMY = [0x00];

  constructor(transport) {
    this.transport = transport;
  }

  async exchange(apdu, rawResponse = false) {
    try {
      /**
       * @type {Response}
       */
      let responseAPDU = await this.transport.exchange(apdu);
      let response = responseAPDU.getBytes();

      if (rawResponse) return response;

      if (response.length < 2) {
        throw new DeviceException('Truncated response');
      }

      this.lastSW =
        ((response[response.length - 2] & 0xff) << 8) |
        (response[response.length - 1] & 0xff);
      let result = [...response];
      result.pop();
      result.pop();
      return result;
    } catch (e) {
      throw e;
    }
  }

  async exchangeCheck(apdu, acceptedSW) {
    const response = await this.exchange(apdu);

    if (!acceptedSW) {
      return response;
    }
    for (let SW of acceptedSW) {
      if (this.lastSW === SW) {
        return response;
      }
    }
    throw new DeviceException('Invalid status', this.lastSW);
  }

  async exchangeApdu(cla, ins, p1, p2, dataOrLength, acceptedSW) {
    let apdu = [];
    apdu[0] = cla;
    apdu[1] = ins;
    apdu[2] = p1;
    apdu[3] = p2;

    if (Array.isArray(dataOrLength)) {
      apdu[4] = dataOrLength.length;

      let offset = 5;
      for (let d of dataOrLength) apdu[offset++] = d;
    } else {
      apdu[4] = dataOrLength;
    }

    return await this.exchangeCheck(apdu, acceptedSW);
  }

  async changePin(pin) {
    pin = ByteUtil.stringToByteArray(pin);
    await this.exchangeApdu(CLA, INS_CHANGE_PIN, 0x00, 0x00, pin, this.OK);
  }

  async verifyPin(pin, acceptedSW = this.OK) {
    pin = ByteUtil.stringToByteArray(pin);
    await this.exchangeApdu(CLA, INS_VERIFY_PIN, 0x00, 0x00, pin, acceptedSW);
  }

  async getVerifyPinRemainingAttempts() {
    let response = await this.exchangeApdu(
      CLA,
      INS_VERIFY_PIN,
      0x80,
      0x00,
      this.DUMMY,
      null
    );

    if (response.length === 1) {
      return parseInt(response[0], 10);
    }

    return this.lastSW;
  }

  async getWalletPublicKey(keyPath) {
    // let data = BIP32Util.splitPath(keyPath);
    // let response = this.exchangeApdu(CLA, INS_GET_WALLET_PUBLIC_KEY, 0x00, 0x00, data, this.OK);
    // let offset = 0;
    // let Key = [response[offset]];
    // offset++;
    // System.arraycopy(response, offset, Key, 0, Key.length);
    // offset += Key.length;
    // let address[] = new byte[response[offset]];
    // offset++;
    // System.arraycopy(response, offset, address, 0, address.length);
    // offset += address.length;
    // byte chainCode[] = new byte[32];
    // System.arraycopy(response, offset, chainCode, 0, chainCode.length);
    // offset += address.length;
    // return new BTChipPublicKey(Key, new String(address), chainCode);
  }

  async getGenuinenessKey() {
    let response = await this.exchangeApdu(
      CLA,
      INS_GET_GENUINENESS_KEY,
      0x00,
      0x00,
      this.DUMMY,
      this.OK
    );

    return response;
  }

  async proveGenuineness(challenge) {
    let response = await this.exchangeApdu(
      CLA,
      INS_PROVE_GENUINENESS,
      0x00,
      0x00,
      challenge,
      this.OK
    );
    response[0] = 0x30;
    return response;
  }

  async signTransactionPrepare(path, hash) {
    let data = new ByteBuffer();
    new Buffer();
    data.put(BIP32Util.splitPath(path));
    data.put(hash);
    await this.exchangeApdu(
      CLA,
      INS_SIGN_TRANSACTION,
      0x00,
      0x00,
      data.toByteArray(),
      this.OK
    );
    return true;
  }

  async signTransaction() {
    let response = await this.exchangeApdu(
      CLA,
      INS_SIGN_TRANSACTION,
      0x80,
      0x00,
      0x00,
      this.OK
    );
    response[0] = 0x30;
    return response;
  }

  async getFirmwareVersion() {
    let response = await this.exchangeApdu(
      CLA,
      INS_GET_FIRMWARE_VERSION,
      0x00,
      0x00,
      0x00,
      this.OK
    );
    let major = parseInt(response[0] & 0xff, 10);
    let minor = parseInt(response[1] & 0xff, 10);
    let patch = parseInt(response[2] & 0xff, 10);
    return { major, minor, patch, string: `${major}.${minor}.${patch}` };
  }

  async getState() {
    let response = await this.exchangeApdu(
      CLA,
      INS_GET_STATE,
      0x00,
      0x00,
      0x00,
      this.OK
    );
    return response[0];
  }

  async getCurrentMode() {
    let response = await this.exchangeApdu(
      CLA,
      INS_GET_MODE,
      0x00,
      0x00,
      0x00,
      this.OK
    );
    return response[0];
  }

  async setup(mode, keyVersion, keyVersionP2SH, userPin = null, seed = null) {
    let operationModeFlags = 0;
    let data = new Buffer(3);
    let offset = 0;

    if (mode !== MODE_DEVELOPER && mode !== MODE_WALLET)
      throw new DeviceException(`Unsupported mode ${mode}`);

    data.writeUInt8(mode, offset++);
    data.writeUInt8(keyVersion, offset++);
    data.writeUInt8(keyVersionP2SH, offset++);

    if (operationModeFlags === MODE_DEVELOPER) {
      // PIN
      if (userPin == null || userPin.length < 4 || userPin.length > 20) {
        throw new DeviceException('Invalid user PIN length');
      }

      data.writeUInt8(userPin.length, offset++);
      data.write(userPin, offset++);

      // SEED
      if (seed == null || seed.length !== 64) {
        throw new DeviceException('Invalid seed length');
      }
      data.write(seed, offset++);
    }

    await this.exchangeApdu(CLA, INS_SETUP, 0x00, 0x00, data, this.OK);
    return true;
  }

  async changeNetwork(keyVersion, keyVersionP2SH) {
    let data = new Buffer(2);
    data.writeUInt8(keyVersion, 0);
    data.writeUInt8(keyVersionP2SH, 1);

    await this.exchangeApdu(CLA, INS_CHANGE_NETWORK, 0x00, 0x00, data, this.OK);
  }

  async randomSeedWords() {
    return await this.exchangeApdu(
      CLA,
      INS_PREPARE_SEED,
      0x00,
      0x00,
      this.DUMMY,
      this.OK
    );
  }

  async erase() {
    await this.exchangeApdu(CLA, INS_ERASE, 0x00, 0x00, this.DUMMY, this.OK);
  }

  async prepareSeed(seed) {
    let data = new Buffer(64);

    if (seed.length !== 64) {
      throw new DeviceException('Invalid seed length');
    }
    data.write(seed, 0);

    await this.exchangeApdu(CLA, INS_PREPARE_SEED, 0x80, 0x00, data, this.OK);
  }

  async validateSeed(seed) {
    let data = new Buffer(64);

    if (seed.length !== 64) {
      throw new DeviceException('Invalid seed length');
    }
    data.write(seed, 0);

    await this.exchangeApdu(
      CLA,
      INS_VALIDATE_SEED_BACKUP,
      0x00,
      0x00,
      data,
      this.OK
    );
  }

  // sendRawAPDU(cmd, data) {
  //    let commandAPDU = Command.build(cmd, data);
  //   return new Response(this.exchange(commandAPDU.getBytes(), true));
  // }
}
