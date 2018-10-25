/*
 *******************************************************************************
 *   Java Card Bitcoin Hardware Wallet
 *   (c) 2015 Ledger
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as
 *   published by the Free Software Foundation, either version 3 of the
 *   License, or (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *******************************************************************************
 */

package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipException;
import com.licel.jcardsim.utils.ByteUtil;
import javacard.security.ECPublicKey;
import javacard.security.KeyBuilder;
import javacard.security.Signature;
import org.bitcoinj.core.ECKey;
import org.bitcoinj.core.NetworkParameters;
import org.bitcoinj.core.Sha256Hash;
import org.bitcoinj.core.Utils;
import org.bitcoinj.crypto.*;
import org.bitcoinj.params.TestNet3Params;
import org.bitcoinj.wallet.DeterministicSeed;
import org.bitcoinj.wallet.UnreadableWalletException;
import org.junit.Assert;
import org.junit.Test;
import org.spongycastle.pqc.math.linearalgebra.ByteUtils;

import static junit.framework.TestCase.fail;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class BitcoinJTest extends AbstractJavaCardTest {
//    @Test
//    public void testSignMessage() throws BTChipException {
////        BTChipDongle dongle = prepareDongleRestoreTestnet(true);
////        dongle.verifyPin(DEFAULT_PIN);
////        dongle.signMessagePrepare("13'/0'/0'/0/42", MSG.getBytes());
////        BTChipDongle.BTChipSignature signature = dongle.signMessageSign(null);
////        assertTrue(Arrays.equals(canonicalizeSignature(signature.getSignature()), EXPECTED_SIGNATURE));
//    }

    @Test
    public void backupToMnemonicSeed() throws UnreadableWalletException, MnemonicException.MnemonicChecksumException, MnemonicException.MnemonicLengthException, MnemonicException.MnemonicWordException {
        NetworkParameters params = TestNet3Params.get();

        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);

//        Wallet wallet = Wallet.fromSeed(params, seed);

        System.out.println(seed.toHexString());
        System.out.println(ByteUtil.hexString(MnemonicCode.INSTANCE.toEntropy(seed.getMnemonicCode())));

        String mnemonic = Utils.toString(DEFAULT_SEED_WORDS, "UTF-8");
//        List<String> list = new ArrayList<String>(Arrays.asList(new String(DEFAULT_SEED_WORDS).(" , ")));

        Assert.assertEquals(new String(DEFAULT_SEED_WORDS), Utils.join(seed.getMnemonicCode()));
        System.out.println(Utils.join(seed.getMnemonicCode()));
        System.out.println(ByteUtil.hexString(seed.getSeedBytes()));
        Assert.assertEquals(ByteUtil.hexString(DEFAULT_SEED), ByteUtil.hexString(seed.getSeedBytes()));
    }


    @Test
    public void seedToMnemonic() throws UnreadableWalletException, MnemonicException.MnemonicLengthException {
        NetworkParameters params = TestNet3Params.get();
        DeterministicSeed seed = new DeterministicSeed(ByteUtil.byteArray("f585c11aec520db57dd353c69554b21a89b20fb0650966fa0a9d6f74fd989d8f"), "", 1409478661L);

        System.out.println(ByteUtil.hexString(seed.getSeedBytes()));
        System.out.println(Utils.join(seed.getMnemonicCode()));
    }

    @Test
    public void generateAddress() throws UnreadableWalletException {
        NetworkParameters params = TestNet3Params.get();

        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);

//        Wallet wallet = Wallet.fromSeed(params, seed);

        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
        DeterministicKey dk44H = HDKeyDerivation.deriveChildKey(dkRoot, 44 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H = HDKeyDerivation.deriveChildKey(dk44H, 1 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H = HDKeyDerivation.deriveChildKey(dk44H0H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H0 = HDKeyDerivation.deriveChildKey(dk44H0H0H, 0);
        DeterministicKey dk44H0H0H00 = HDKeyDerivation.deriveChildKey(dk44H0H0H0, 0);

        System.out.println(dk44H0H0H00.toAddress(params));
        System.out.println(ByteUtil.hexString(dk44H0H0H00.getChainCode()));
        System.out.println(ByteUtil.hexString(dk44H0H0H00.getPubKeyPoint().getEncoded()));
        System.out.println(dk44H0H0H00.getPubKeyPoint());
    }

    @Test
    public void generateAddressAccount1InternalIndex7() throws UnreadableWalletException {
        NetworkParameters params = TestNet3Params.get();

        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);

//        Wallet wallet = Wallet.fromSeed(params, seed);

        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
        DeterministicKey dk44H = HDKeyDerivation.deriveChildKey(dkRoot, 44 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H = HDKeyDerivation.deriveChildKey(dk44H, 1 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H = HDKeyDerivation.deriveChildKey(dk44H0H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H0 = HDKeyDerivation.deriveChildKey(dk44H0H0H, 1);
        DeterministicKey dk44H0H0H00 = HDKeyDerivation.deriveChildKey(dk44H0H0H0, 7);

        System.out.println(dk44H0H0H00.toAddress(params));
        System.out.println(ByteUtil.hexString(dk44H0H0H00.getChainCode()));
        System.out.println(ByteUtil.hexString(dk44H0H0H00.getPubKeyPoint().getEncoded()));
        System.out.println(dk44H0H0H00.getPubKeyPoint());
        System.out.println(dk44H0H0H00.getPrivateKeyAsHex());
        System.out.println(dk44H0H0H00.getPrivateKeyAsWiF(params));
    }

    @Test
    public void signTest() throws UnreadableWalletException, BTChipException {
        String hash = "edfe77f05b19741c8908a5a05cb15f3dd3f4d0029b38b659e98d8a4c10e00bb9";
        byte[] challengeBytes = ByteUtil.byteArray(hash);

        NetworkParameters params = TestNet3Params.get();

        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);

//        Wallet wallet = Wallet.fromSeed(params, seed);

        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
        DeterministicKey dk44H = HDKeyDerivation.deriveChildKey(dkRoot, 44 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H = HDKeyDerivation.deriveChildKey(dk44H, 1 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H = HDKeyDerivation.deriveChildKey(dk44H0H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H0 = HDKeyDerivation.deriveChildKey(dk44H0H0H, 0);
        DeterministicKey dk44H0H0H00 = HDKeyDerivation.deriveChildKey(dk44H0H0H0, 0);

        System.out.println("ADDRESS");
        System.out.println(dk44H0H0H00.toAddress(params));
//        System.out.println(ByteUtil.hexString(dk44H0H0H00.getChainCode()));
//        System.out.println(ByteUtil.hexString(dk44H0H0H00.getPubKeyPoint().getEncoded()));
        System.out.println("PUBLIC");
        System.out.println(ByteUtils.toHexString(dk44H0H0H00.getPubKeyPoint().getEncoded(false)));
        System.out.println("PUBLIC POINT");
        System.out.println(dk44H0H0H00.getPubKeyPoint());
        System.out.println("PRIVATE");
        System.out.println(dk44H0H0H00.getPrivateKeyAsHex());

        byte[] publicKey = dk44H0H0H00.getPubKeyPoint().getEncoded(false);
        byte[] signature = dk44H0H0H00.sign(Sha256Hash.wrap(challengeBytes)).encodeToDER();
        System.out.println("SIGNATURE");
        System.out.println(ByteUtils.toHexString(signature));
        signature = canonicalizeSignature(signature);

        System.out.println("SIGNATURE CANONICALIZED");
        System.out.println(ByteUtils.toHexString(signature));

        ECPublicKey publicKeyEC = (ECPublicKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PUBLIC, KeyBuilder.LENGTH_EC_FP_256, false);
        Secp256k1.setCommonCurveParameters(publicKeyEC);
        publicKeyEC.setW(publicKey, (short)0, (short)65);

        Signature signatureEC = Signature.getInstance(Signature.ALG_ECDSA_SHA_256, false);
        signatureEC.init(publicKeyEC, Signature.MODE_VERIFY);
        try {
            assertTrue(dk44H0H0H00.verify(challengeBytes, signature, publicKey));
//            assertTrue(signatureEC.verify(challengeBytes, (short)0, (short)32, signature, (short)0, (short)signature.length));
        } catch(Exception e) {
            fail();
        }
    }

//    @Test
//    public void generateAddress13() throws UnreadableWalletException {
//        NetworkParameters params = TestNet3Params.get();
//
//        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);
//
////        Wallet wallet = Wallet.fromSeed(params, seed);
//
//        // "13'/0'/0'/0/42"
//        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
//        DeterministicKey dk44H = HDKeyDerivation.deriveChildKey(dkRoot, 13 | ChildNumber.HARDENED_BIT);
//        DeterministicKey dk44H0H = HDKeyDerivation.deriveChildKey(dk44H, 0 | ChildNumber.HARDENED_BIT);
//        DeterministicKey dk44H0H0H = HDKeyDerivation.deriveChildKey(dk44H0H, 0 | ChildNumber.HARDENED_BIT);
//        DeterministicKey dk44H0H0H0 = HDKeyDerivation.deriveChildKey(dk44H0H0H, 0);
//        DeterministicKey dk44H0H0H042 = HDKeyDerivation.deriveChildKey(dk44H0H0H0, 42);
//
////        System.out.println(dk44H0H0H042.toAddress(params));
////        System.out.println(dk44H0H0H042.getPubKeyPoint());
////        System.out.println(ByteUtil.hexString(dk44H0H0H042.getChainCode()));
//
//        Sha256Hash hash = Sha256Hash.wrap("9566fb3aee440cf853372f2ed1f287d7c7e01717f22f6427056efa0cae52252c");
//        // Sign
//        ECKey.ECDSASignature signature = dk44H0H0H042.sign(hash);
////        System.out.println(signature.isCanonical());
////        System.out.println(signature.r);
////        System.out.println(signature.s);
////        System.out.println(ByteUtil.hexString(signature.encodeToDER()));
//        assertTrue(dk44H0H0H042.verify(hash, signature));
////
////        signature = ECKey.ECDSASignature.decodeFromDER(ByteUtil.byteArray("304402205eabeefae7d20bfe0e6c43012cd2348598cae7b052f6df0add9fd70161941c8802200f9520b90f46d39265a75f652d2741cd3130989017795213b6decde30ed543ca"));
////        System.out.println(signature.isCanonical());
////        System.out.println(signature.r);
////        System.out.println(signature.s);
////        System.out.println(ByteUtil.hexString(signature.encodeToDER()));
////        assertTrue(dk44H0H0H042.verify(hash, signature));
//    }
}

