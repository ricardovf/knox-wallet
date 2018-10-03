import bip32 from 'bip32';
import bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';

function getAddress(node, network) {
  return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address;
}

it('generate bip44 address', () => {
  const root = bip32.fromSeed(
    Buffer.from(
      'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
      'hex'
    )
  );

  const child1 = root.derivePath("m/44'/0'/0'/0/0");

  expect(getAddress(child1)).toEqual('12Tyvr1U8A3ped6zwMEU5M8cx3G38sP5Au');
});

it('generate bip44 address', () => {
  const mnemonic =
    'praise you muffin lion enable neck grocery crumble super myself license ghost';
  expect(bip39.validateMnemonic(mnemonic)).toBeTruthy();

  const seed = bip39.mnemonicToSeed(mnemonic);
  const root = bip32.fromSeed(seed);

  // receive addresses
  expect(getAddress(root.derivePath("m/0'/0/0"))).toEqual(
    '1AVQHbGuES57wD68AJi7Gcobc3RZrfYWTC'
  );
  expect(getAddress(root.derivePath("m/0'/0/1"))).toEqual(
    '1Ad6nsmqDzbQo5a822C9bkvAfrYv9mc1JL'
  );

  // change addresses
  expect(getAddress(root.derivePath("m/0'/1/0"))).toEqual(
    '1349KVc5NgedaK7DvuD4xDFxL86QN1Hvdn'
  );
  expect(getAddress(root.derivePath("m/0'/1/1"))).toEqual(
    '1EAvj4edpsWcSer3duybAd4KiR4bCJW5J6'
  );
});

it('sign transaction', () => {
  const mnemonic =
    'praise you muffin lion enable neck grocery crumble super myself license ghost';
  expect(bip39.validateMnemonic(mnemonic)).toBeTruthy();

  const seed = bip39.mnemonicToSeed(mnemonic);
  const root = bip32.fromSeed(seed);

  // receive addresses
  expect(getAddress(root.derivePath("m/0'/0/0"))).toEqual(
    '1AVQHbGuES57wD68AJi7Gcobc3RZrfYWTC'
  );
  expect(getAddress(root.derivePath("m/0'/0/1"))).toEqual(
    '1Ad6nsmqDzbQo5a822C9bkvAfrYv9mc1JL'
  );

  // change addresses
  expect(getAddress(root.derivePath("m/0'/1/0"))).toEqual(
    '1349KVc5NgedaK7DvuD4xDFxL86QN1Hvdn'
  );
  expect(getAddress(root.derivePath("m/0'/1/1"))).toEqual(
    '1EAvj4edpsWcSer3duybAd4KiR4bCJW5J6'
  );
});

it('can verify transaction signatures', function() {
  const txHex =
    '010000000321c5f7e7bc98b3feda84aad36a5c99a02bcb8823a2f3eccbcd5da209698b5c20000000006b48304502210099e021772830207cf7c55b69948d3b16b4dcbf1f55a9cd80ebf8221a169735f9022064d33f11d62cd28240b3862afc0b901adc9f231c7124dd19bdb30367b61964c50121032b4c06c06c3ec0b7fa29519dfa5aae193ee2cc35ca127f29f14ec605d62fb63dffffffff8a75ce85441ddb3f342708ee33cc8ed418b07d9ba9e0e7c4e1cccfe9f52d8a88000000006946304302207916c23dae212c95a920423902fa44e939fb3d542f4478a7b46e9cde53705800021f0d74e9504146e404c1b8f9cba4dff2d4782e3075491c9ed07ce4a7d1c4461a01210216c92abe433106491bdeb4a261226f20f5a4ac86220cc6e37655aac6bf3c1f2affffffffdfef93f69fe32e944fad79fa8f882b3a155d80383252348caba1a77a5abbf7ef000000006b483045022100faa6e9ca289b46c64764a624c59ac30d9abcf1d4a04c4de9089e67cbe0d300a502206930afa683f6807502de5c2431bf9a1fd333c8a2910a76304df0f3d23d83443f0121039e05da8b8ea4f9868ecebb25998c7701542986233f4401799551fbecf316b18fffffffff01ff4b0000000000001976a9146c86476d1d85cd60116cd122a274e6a570a5a35c88acc96d0700';
  const keyPairs = [
    '032b4c06c06c3ec0b7fa29519dfa5aae193ee2cc35ca127f29f14ec605d62fb63d',
    '0216c92abe433106491bdeb4a261226f20f5a4ac86220cc6e37655aac6bf3c1f2a',
    '039e05da8b8ea4f9868ecebb25998c7701542986233f4401799551fbecf316b18f',
  ].map(function(q) {
    return bitcoin.ECPair.fromPublicKey(Buffer.from(q, 'hex'));
  });

  const tx = bitcoin.Transaction.fromHex(txHex);

  tx.ins.forEach(function(input, i) {
    const keyPair = keyPairs[i];
    const p2pkh = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      input: input.script,
    });

    // console.log(p2pkh.signature.toString('hex'));

    const ss = bitcoin.script.signature.decode(p2pkh.signature);
    const hash = tx.hashForSignature(i, p2pkh.output, ss.hashType);

    // console.log(hash.toString('hex'));
    // console.log(ss.signature.toString('hex'));

    expect(keyPair.verify(hash, ss.signature)).toEqual(true);
  });
});
