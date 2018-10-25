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
  INS_PIN_VERIFIED,
  INS_PREPARE_SEED,
  INS_PROVE_GENUINENESS,
  INS_SETUP,
  INS_SIGN_TRANSACTION,
  INS_VALIDATE_SEED_BACKUP,
  INS_VERIFY_PIN,
  MODE_DEVELOPMENT,
  MODE_WALLET,
  SIGHASH_ALL,
  SW_OK,
} from './Constants';
import DeviceException from './DeviceException';
import BIP32Util from './util/BIP32Util';
import { Buffer } from 'buffer';
import ByteUtil from './util/ByteUtil';
import { statusWordToMessage } from './APDU/Response';
import { isValidPinContent, isValidPinLength } from './util/PIN';
import bip39 from 'bip39';

export default class SecureDevice {
  transport = null;
  lastSW = null;
  lastSWMessage = null;

  OK = [SW_OK];
  DUMMY = [0x00];

  constructor(transport) {
    this.transport = transport;
  }

  async exchange(apdu, rawResponse = false) {
    if (!Buffer.isBuffer(apdu)) {
      throw new DeviceException('APDU must be a Buffer object');
    }

    try {
      /**
       * @type {Response}
       */
      let responseAPDU = await this.transport.exchange(apdu);
      let response = responseAPDU.getBuffer();

      this.lastSWMessage = statusWordToMessage(responseAPDU.getStatusCode());
      this.lastSW = responseAPDU.getStatusCode();

      if (rawResponse) return response;

      if (response.length < 2) {
        throw new DeviceException('Truncated response');
      }

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

    if (!acceptedSW) return response;

    for (let SW of acceptedSW) {
      if (this.lastSW === SW) {
        return response;
      }
    }
    throw new DeviceException(
      this.lastSWMessage ? this.lastSWMessage : 'Invalid status',
      this.lastSW
    );
  }

  /**
   * @param cla
   * @param ins
   * @param p1
   * @param p2
   * @param dataOrLength
   * @param acceptedSW
   * @return {Promise<Response>}
   */
  async exchangeApdu(cla, ins, p1, p2, dataOrLength, acceptedSW) {
    let apdu;
    if (Buffer.isBuffer(dataOrLength) || Array.isArray(dataOrLength)) {
      apdu = new Buffer(5 + dataOrLength.length);
      apdu[0] = cla;
      apdu[1] = ins;
      apdu[2] = p1;
      apdu[3] = p2;
      apdu[4] = dataOrLength.length;
      apdu.set(dataOrLength, 5);
    } else if (!isNaN(dataOrLength)) {
      // No data, just the expected length of the response
      apdu = new Buffer(5);
      apdu[0] = cla;
      apdu[1] = ins;
      apdu[2] = p1;
      apdu[3] = p2;
      apdu[4] = parseInt(dataOrLength, 10);
    } else {
      throw new DeviceException('Data must be a Buffer object');
    }

    // if (ins === INS_VERIFY_PIN)
    // console.log('exchangeApdu: ' + apdu.toString('hex'));

    return await this.exchangeCheck(apdu, acceptedSW);
  }

  async changePin(pin) {
    if (!isValidPinLength(pin)) {
      throw new DeviceException('Invalid user PIN length');
    }

    if (!isValidPinContent(pin)) {
      throw new DeviceException(
        'User PIN must contain only numbers from 0 to 9'
      );
    }

    let data = new Buffer(pin.length);
    data.write(pin, 0, pin.length, 'ascii');

    await this.exchangeApdu(CLA, INS_CHANGE_PIN, 0x00, 0x00, data, this.OK);
  }

  /**
   * @return {Promise<boolean>}
   */
  async isPinVerified() {
    try {
      await this.exchangeApdu(
        CLA,
        INS_PIN_VERIFIED,
        0x00,
        0x00,
        this.DUMMY,
        this.OK
      );
      return Promise.resolve(true);
    } catch (e) {}

    return Promise.resolve(false);
  }

  async verifyPin(pin, acceptedSW = this.OK) {
    if (!isValidPinLength(pin)) {
      throw new DeviceException('Invalid user PIN length');
    }

    if (!isValidPinContent(pin)) {
      throw new DeviceException(
        'User PIN must contain only numbers from 0 to 9'
      );
    }

    let data = new Buffer(pin.length);
    data.write(pin, 0, pin.length, 'ascii');

    await this.exchangeApdu(CLA, INS_VERIFY_PIN, 0x00, 0x00, data, acceptedSW);
  }

  async getVerifyPinRemainingAttempts() {
    let response = await this.exchangeApdu(
      CLA,
      INS_VERIFY_PIN,
      0x80,
      0x00,
      this.DUMMY,
      this.OK
    );

    if (response.length === 1) {
      return parseInt(response[0], 10);
    }

    return this.lastSW;
  }

  async getAddress(path) {
    let pub = await this.getWalletPublicKey(path, true);
    return pub.address;
  }

  async getWalletPublicKey(path, asString = true) {
    path = BIP32Util.splitPath(path);

    let response = await this.exchangeApdu(
      CLA,
      INS_GET_WALLET_PUBLIC_KEY,
      0x00,
      0x00,
      path,
      this.OK
    );

    let data = Buffer.from(response);

    let offset = 0;

    let publicKey = new Buffer(data.readUInt8(offset++));
    publicKey.set(response.slice(offset, offset + publicKey.length));
    offset += publicKey.length;

    let address = new Buffer(data.readUInt8(offset++));
    address.set(response.slice(offset, offset + address.length));
    offset += address.length;

    let chainCode = new Buffer(32);
    chainCode.set(response.slice(offset, offset + chainCode.length));

    if (asString)
      return {
        publicKey: publicKey.toString('hex'),
        address: address.toString('ascii'),
        chainCode: chainCode.toString('hex'),
      };
    else return { publicKey, address, chainCode };
  }

  async getGenuinenessKey(asString = true) {
    let response = await this.exchangeApdu(
      CLA,
      INS_GET_GENUINENESS_KEY,
      0x00,
      0x00,
      this.DUMMY,
      this.OK
    );

    response = Buffer.from(response);

    return asString ? response.toString('hex') : response;
  }

  async proveGenuineness(challenge, asString = true) {
    let data = new Buffer(32);

    if (challenge == null || challenge.length !== 64) {
      throw new DeviceException('Invalid challenge length');
    }

    challenge = ByteUtil.toByteArray(challenge);
    data.set(challenge, 0);

    let response = await this.exchangeApdu(
      CLA,
      INS_PROVE_GENUINENESS,
      0x00,
      0x00,
      data,
      this.OK
    );
    response[0] = 0x30;

    // Treat this signature as
    // response.push(0x01);

    response = Buffer.from(response);

    return asString ? response.toString('hex') : response;
  }

  async signTransactionPrepare(path, hash) {
    if (Buffer.isBuffer(hash)) hash = hash.toString('hex');

    if (hash == null || hash.length !== 64) {
      throw new DeviceException('Invalid hash length');
    }
    hash = ByteUtil.toByteArray(hash);
    path = BIP32Util.splitPath(path);
    let data = new Buffer(path.length + hash.length);
    data.set(path, 0);
    data.set(hash, path.length);

    await this.exchangeApdu(
      CLA,
      INS_SIGN_TRANSACTION,
      0x00,
      0x00,
      data,
      this.OK
    );
  }

  async signTransaction(path, hash, asString = true, addSigType = true) {
    await this.signTransactionPrepare(path, hash);
    return await this.signTransactionExecute(asString, addSigType);
  }

  async signTransactionExecute(asString = true, addSigType = true) {
    let response = await this.exchangeApdu(
      CLA,
      INS_SIGN_TRANSACTION,
      0x80,
      0x00,
      0x00,
      this.OK
    );
    response[0] = 0x30;

    // https://bitcoin.stackexchange.com/questions/37125/how-are-sighash-flags-encoded-into-a-signature
    if (addSigType) response.push(SIGHASH_ALL);

    response = Buffer.from(response);

    return asString ? response.toString('hex') : response;
  }

  async getFirmwareVersion(asString = true) {
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
    let firmware = {
      major,
      minor,
      patch,
      string: `${major}.${minor}.${patch}`,
    };
    return asString ? firmware.string : firmware;
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
    // Allocate the maximum size
    let data = new Buffer(3 + 20 + 64);
    let offset = 0;

    if (mode !== MODE_DEVELOPMENT && mode !== MODE_WALLET)
      throw new DeviceException(`Unsupported mode ${mode}`);

    data.writeUInt8(mode, offset++);
    data.writeUInt8(keyVersion, offset++);
    data.writeUInt8(keyVersionP2SH, offset++);

    if (mode === MODE_DEVELOPMENT) {
      // PIN
      if (userPin == null || userPin.length < 4 || userPin.length > 20) {
        throw new DeviceException('Invalid user PIN length');
      }

      if (!/^\d+$/g.test(userPin)) {
        throw new DeviceException(
          'User PIN must contain only numbers from 0 to 9'
        );
      }

      data.writeUInt8(userPin.length, offset++);
      offset += data.write(userPin, offset, userPin.length, 'ascii');

      // SEED
      if (seed == null || seed.length !== 128) {
        throw new DeviceException('Invalid seed length');
      }
      seed = ByteUtil.toByteArray(seed);
      data.set(seed, offset);

      data = data.slice(0, offset + seed.length);
      // console.log(data.toString('hex'));
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

  async randomSeedWords(returnWords = true) {
    let data = await this.exchangeApdu(
      CLA,
      INS_PREPARE_SEED,
      0x00,
      0x00,
      this.DUMMY,
      this.OK
    );

    let wordsIndexes = [];
    let tmpBuffer = new Buffer(2);
    for (let i = 0; i < data.length; i += 2) {
      tmpBuffer.writeUInt8(data[i], 0);
      tmpBuffer.writeUInt8(data[i + 1], 1);
      wordsIndexes.push(tmpBuffer.readUInt16BE(0));
    }

    if (returnWords) {
      return wordsIndexes.map(i => bip39.wordlists.english[i]);
    }

    return wordsIndexes;
  }

  async erase() {
    await this.exchangeApdu(CLA, INS_ERASE, 0x00, 0x00, this.DUMMY, this.OK);
  }

  async prepareSeed(seed, seedIsWordList = false) {
    if (seedIsWordList) {
      // Must convert the bip 39 words to seed
      seed = bip39.mnemonicToSeedHex(seed.join(' '));
    }

    if (seed == null || seed.length !== 128) {
      throw new DeviceException('Invalid seed length');
    }

    seed = ByteUtil.toByteArray(seed);
    let data = new Buffer(64);
    data.set(seed, 0);

    await this.exchangeApdu(CLA, INS_PREPARE_SEED, 0x80, 0x00, data, this.OK);
  }

  async validateSeed(seed) {
    let data = new Buffer(64);

    if (seed == null || seed.length !== 128) {
      throw new DeviceException('Invalid seed length');
    }

    seed = ByteUtil.toByteArray(seed);
    data.set(seed, 0);

    await this.exchangeApdu(
      CLA,
      INS_VALIDATE_SEED_BACKUP,
      0x00,
      0x00,
      data,
      this.OK
    );
  }
}
