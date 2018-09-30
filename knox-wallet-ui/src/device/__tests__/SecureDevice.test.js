import SecureDevice from '../SecureDevice';
import TransportHTTP from '../TransportHTTP';
import ByteUtil from '../util/ByteUtil';
import {
  BITCOIN_TESTNET_P2SH_VERSION,
  BITCOIN_TESTNET_VERSION,
  MODE_WALLET,
} from '../Constants';

export const DEFAULT_PIN = '1234';
export const DEFAULT_SEED_WORDS =
  'void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold';
export const DEFAULT_SEED =
  'b873212f885ccffbf4692afcb84bc2e55886de2dfa07d90f5c3c239abc31c0a6ce047e30fd8bf6a281e71389aa82d73df74c7bbfb3b06b4639a5cee775cccd3c';

it('can get genuineness public key with 65 bytes', async () => {
  let device = new SecureDevice(new TransportHTTP(true));

  let key = await device.getGenuinenessKey();

  // console.log(ByteUtil.toHexString(key));

  expect(key).toHaveLength(65);
});

it('can verify pin', async () => {
  let device = new SecureDevice(new TransportHTTP(true));
  await device.setup(
    MODE_WALLET,
    BITCOIN_TESTNET_VERSION,
    BITCOIN_TESTNET_P2SH_VERSION,
    DEFAULT_PIN,
    DEFAULT_SEED
  );

  // await device.verifyPin();
});
