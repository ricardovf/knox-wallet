import SecureDevice from '../SecureDevice';
import TransportHTTP from '../TransportHTTP';
import {
  BITCOIN_TESTNET_P2SH_VERSION,
  BITCOIN_TESTNET_VERSION,
  MODE_DEVELOPMENT,
  MODE_WALLET,
  STATE_PIN_SET,
  STATE_READY,
  STATE_SETUP_DONE,
} from '../Constants';
import DeviceException from '../DeviceException';
import BIP32Util from '../util/BIP32Util';
import * as bitcoin from 'bitcoinjs-lib';
import { ec as EC } from 'elliptic';
import Signature from 'elliptic/lib/elliptic/ec/signature';
import bigInt from 'big-integer';

const debug = false;

export const DEFAULT_PIN = '1234';
export const DEFAULT_SEED_WORDS =
  'void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold';
export const DEFAULT_SEED =
  'b873212f885ccffbf4692afcb84bc2e55886de2dfa07d90f5c3c239abc31c0a6ce047e30fd8bf6a281e71389aa82d73df74c7bbfb3b06b4639a5cee775cccd3c';
export const ANOTHER_SEED =
  '2cdb89ce5186861b2304226740eb2b5a589ea4cf9d4292848b4278873d0a49b92169fd0be6e9af1763b0ebc09f44061cb56ef04be3f73ab5276d658c2df589f1';

it('can ping the transport', async () => {
  let transport = new TransportHTTP(debug);
  let response = await transport.ping();
  expect(response).toEqual('PONG');
});

it('can reset the transport', async () => {
  let transport = new TransportHTTP(debug);
  let response = await transport.reset();
  expect(response).toEqual('OK');
});

it('can setup develop', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();
  await device.setup(
    MODE_DEVELOPMENT,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION,
    DEFAULT_PIN,
    DEFAULT_SEED
  );

  // Should be on development mode and ready state
  expect(await device.getCurrentMode()).toEqual(MODE_DEVELOPMENT);
  expect(await device.getState()).toEqual(STATE_READY);

  try {
    await device.setup(
      MODE_DEVELOPMENT,
      BITCOIN_TESTNET_VERSION,
      BITCOIN_TESTNET_P2SH_VERSION,
      DEFAULT_PIN,
      DEFAULT_SEED
    );
  } catch (e) {
    expect(e.message).toMatch('Checking error');
    expect(e instanceof DeviceException).toBeTruthy();
  }
});

it('can setup normal mode', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();
  await device.setup(
    MODE_WALLET,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION
  );

  expect(await device.getCurrentMode()).toEqual(MODE_WALLET);
  expect(await device.getState()).toEqual(STATE_SETUP_DONE);

  // Can't prepare seed cause there is not PIN set
  try {
    await device.prepareSeed(DEFAULT_SEED);
  } catch (e) {
    expect(e.message).toMatch('Checking error');
    expect(e instanceof DeviceException).toBeTruthy();
  }

  await device.changePin(DEFAULT_PIN);
  expect(await device.getState()).toEqual(STATE_PIN_SET);
  await device.verifyPin(DEFAULT_PIN);
  await device.prepareSeed(ANOTHER_SEED);
  expect(await device.getState()).toEqual(STATE_READY);
  await device.validateSeed(ANOTHER_SEED);
});

it('can setup normal mode getting random words', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();
  await device.setup(
    MODE_WALLET,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION
  );

  expect(await device.getCurrentMode()).toEqual(MODE_WALLET);
  expect(await device.getState()).toEqual(STATE_SETUP_DONE);

  await device.changePin(DEFAULT_PIN);
  expect(await device.getState()).toEqual(STATE_PIN_SET);
  await device.verifyPin(DEFAULT_PIN);

  // Get a random new seed words
  let seedWordsIndex = await device.randomSeedWords();

  // console.log(seedWordsIndex);
  // @todo derive seed from words and prepare wallet seed

  // await device.prepareSeed(ANOTHER_SEED);
  // expect(await device.getState()).toEqual(STATE_READY);
  // await device.validateSeed(ANOTHER_SEED);
});

it('can get the firmware version', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();
  await device.setup(
    MODE_WALLET,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION
  );

  expect(await device.getFirmwareVersion()).toEqual({
    major: 0,
    minor: 5,
    patch: 0,
    string: '0.5.0',
  });
});

it('can get pin tries remaining', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();
  await device.setup(
    MODE_DEVELOPMENT,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION,
    DEFAULT_PIN,
    DEFAULT_SEED
  );

  expect(await device.getVerifyPinRemainingAttempts()).toEqual(5);
  try {
    await device.verifyPin('9999');
  } catch (e) {}
  expect(await device.getVerifyPinRemainingAttempts()).toEqual(4);
  try {
    await device.verifyPin('8888');
  } catch (e) {}
  expect(await device.getVerifyPinRemainingAttempts()).toEqual(3);
  await device.verifyPin(DEFAULT_PIN);
  expect(await device.getVerifyPinRemainingAttempts()).toEqual(5);
});

it('can erase device', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();
  await device.setup(
    MODE_WALLET,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION
  );

  // Can't erase cause is not in ready state
  try {
    await device.erase();
  } catch (e) {
    expect(e.message).toMatch('Checking error');
    expect(e instanceof DeviceException).toBeTruthy();
  }

  await device.changePin(DEFAULT_PIN);
  await device.verifyPin(DEFAULT_PIN);
  await device.prepareSeed(ANOTHER_SEED);
  await device.erase();

  expect(await device.getCurrentMode()).toEqual(MODE_WALLET);
  expect(await device.getState()).toEqual(STATE_SETUP_DONE);
});

it('can get public addresses', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();
  await device.setup(
    MODE_DEVELOPMENT,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION,
    DEFAULT_PIN,
    DEFAULT_SEED
  );

  let path = "44'/1'/0'/0/0";

  await device.verifyPin(DEFAULT_PIN);

  let pathBytes = BIP32Util.splitPath(path);
  expect(pathBytes.toString('hex')).toEqual(
    '058000002c80000001800000000000000000000000'
  );

  let pub = await device.getWalletPublicKey(path);
  expect(pub).toEqual({
    publicKey:
      '04ecbbabc1b27a4e1a0a7b38611e70e0d08d7b21d6bf1365296f90dbe195f2fe9f380eb1a634da7e91275d58685f2577a8df9006372d8a61fef01514a9c198e58c',
    address: 'mkWwBRoFVYr8xQci3tr8VteayMYLKBhcxG',
    chainCode:
      '3a10c899056ed8101abb9aeca2aead9812c95d96b034c0d7b8d07fbda3fcdce0',
  });
});

it('can change network', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();
  await device.setup(
    MODE_DEVELOPMENT,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION,
    DEFAULT_PIN,
    DEFAULT_SEED
  );

  // Can't change network without PIN
  try {
    await device.changeNetwork(0, 0);
  } catch (e) {
    expect(e.message).toMatch('Checking error');
    expect(e instanceof DeviceException).toBeTruthy();
  }

  await device.verifyPin(DEFAULT_PIN);

  await device.changeNetwork(0, 0);
});

it('can get genuineness public key with 65 bytes', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();

  let key = await device.getGenuinenessKey(false);

  // console.log(ByteUtil.toHexString(key));

  expect(key).toHaveLength(65);
});

it('can sign a transaction', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();
  await device.setup(
    MODE_DEVELOPMENT,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION,
    DEFAULT_PIN,
    DEFAULT_SEED
  );

  await device.verifyPin(DEFAULT_PIN);

  let path = "44'/1'/0'/0/0";
  let hash = 'edfe77f05b19741c8908a5a05cb15f3dd3f4d0029b38b659e98d8a4c10e00bb9';

  let publicKey = (await device.getWalletPublicKey(path, false)).publicKey;
  let signature = await device.signTransaction(path, hash, false, false);
  let signatureSigType = await device.signTransaction(path, hash, false, true);

  hash = Buffer.from(hash, 'hex');

  // console.log(signature.toString('hex'));
  // console.log(publicKey.toString('hex'));
  // console.log(hash.toString('hex'));

  // Can verify using signature type (bitcoin-lib)
  const ss = bitcoin.script.signature.decode(signatureSigType);
  const keyPair = bitcoin.ECPair.fromPublicKey(publicKey);
  expect(keyPair.verify(hash, ss.signature)).toBeTruthy();

  // Can verify using secp256k1 directly
  let ec = new EC('secp256k1');

  let keyFromJava = ec.keyFromPublic(publicKey.toString('hex'), 'hex');

  let sig = new Signature(signature.toString('hex'), 'hex');

  // Can verify using java signature
  expect(
    ec.verify(
      hash.toString('hex'),
      signature.toString('hex'),
      publicKey.toString('hex'),
      'hex'
    )
  ).toBeTruthy();
  expect(keyFromJava.verify(hash, sig)).toBeTruthy();
});

it('can decode DER signature', async () => {
  let der =
    '3044022044d0fbb832fac68d1c965f3b7f448deebcf9eb8fe469f458f542be395c68139a022022c204a2bb561df058091ecf16d59f7aaa97eba4a701c5b4a615a2fe6760a0b9';
  let R =
    '31126515197468027214933240576345115136564245539326620668929069298772882232218';
  let S =
    '15721437176623636005159904759903443163039200030007572040813464894095321243833';

  let sig = new Signature(der, 'hex');

  expect(sig.toDER('hex')).toEqual(der);
  expect(sig.r.toString()).toEqual(R);
  expect(sig.s.toString()).toEqual(S);
});

it('can verify genuineness', async () => {
  let device = new SecureDevice(new TransportHTTP(debug));
  await device.transport.reset();
  await device.setup(
    MODE_DEVELOPMENT,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION,
    DEFAULT_PIN,
    DEFAULT_SEED
  );

  await device.verifyPin(DEFAULT_PIN);

  let hash = 'edfe77f05b19741c8908a5a05cb15f3dd3f4d0029b38b659e98d8a4c10e00bb9';

  let publicKey = await device.getGenuinenessKey(false);
  let signature = await device.proveGenuineness(hash, false);

  hash = Buffer.from(hash, 'hex');

  let privateGen =
    '6c5544797a91115dc3330ebd003851d239a706ff2aa2ab70039c5510ddf06420eceb88926b05d3b151373e8b6fdec284db569204ca13d2caa23bd1d85dcab02a';

  // console.log(signature.toString('hex'));
  // console.log(publicKey.toString('hex'));
  // console.log(hash.toString('hex'));
  //
  // const ss = bitcoin.script.signature.decode(signature);
  // const keyPair = bitcoin.ECPair.fromPublicKey(publicKey);
  // expect(keyPair.verify(hash, ss.signature)).toBeTruthy();

  let ec = new EC('secp256k1');

  // Generate keys
  let keyFromJava = ec.keyFromPublic(publicKey.toString('hex'), 'hex');
  // console.log(publicKey.toString('hex'));
  // console.log(keyFromJava);

  let keyPrivate = ec.keyFromPrivate(privateGen, 'hex');

  let keyFromJS = ec.keyFromPublic(keyPrivate.getPublic());
  // console.log(keyPrivate.getPublic());
  // console.log(keyFromJS);
  // console.log(keyPrivate.getPublic('hex'));

  // Can verify using js signature
  expect(keyFromJS.verify(hash, keyPrivate.sign(hash))).toBeTruthy();

  let sig = new Signature(signature.toString('hex'), 'hex');

  // Can verify using java signature
  expect(
    ec.verify(
      hash.toString('hex'),
      signature.toString('hex'),
      publicKey.toString('hex'),
      'hex'
    )
  ).toBeTruthy();
  expect(keyFromJava.verify(hash, sig)).toBeTruthy();
});
