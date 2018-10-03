package com.knox.playground.basic;//package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import com.licel.jcardsim.bouncycastle.asn1.ASN1Sequence;
import com.licel.jcardsim.bouncycastle.asn1.DERInteger;
import com.licel.jcardsim.utils.ByteUtil;
import javacard.security.KeyBuilder;
import javacard.security.Signature;
import org.bitcoin.NativeSecp256k1Util;
import org.bitcoinj.core.*;
import org.bitcoinj.core.Base58;
import org.bitcoinj.crypto.ChildNumber;
import org.bitcoinj.crypto.DeterministicKey;
import org.bitcoinj.crypto.HDKeyDerivation;
import org.bitcoinj.crypto.LazyECPoint;
import org.bitcoinj.params.TestNet3Params;
import org.bitcoinj.wallet.DeterministicSeed;
import org.bitcoinj.wallet.UnreadableWalletException;
import org.junit.Test;
import org.spongycastle.crypto.params.ECPublicKeyParameters;
import org.spongycastle.crypto.signers.ECDSASigner;

import java.io.IOException;
import java.math.BigInteger;
import javacard.security.ECPublicKey;
import org.spongycastle.crypto.util.PrivateKeyFactory;
import org.spongycastle.math.ec.ECCurve;
import org.spongycastle.math.ec.ECPoint;
import org.spongycastle.pqc.math.linearalgebra.ByteUtils;

import static junit.framework.TestCase.fail;
import static org.bitcoinj.core.ECKey.CURVE;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class GenuinenessTest extends AbstractJavaCardTest {
    @Test
    public void testGetPublicWhenSetupNotDoneKey() throws BTChipException, UnreadableWalletException, IOException {
        BTChipDongle dongle = getDongle(true);

        byte[] publicKey = dongle.getGenuinenessKey();

        assertEquals(65, publicKey.length);

        // Make curve to compare
        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);
        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
        ECCurve curve = dkRoot.getPubKeyPoint().getCurve();
        ECPoint point = curve.decodePoint(publicKey);

        assertEquals(ByteUtil.hexString(point.getEncoded(false)), ByteUtil.hexString(publicKey));
//
//        System.out.println(point.getXCoord().toString());
//        System.out.println(point.getYCoord().toString());
    }

    @Test
    public void testIfPublicKeyFromPrivateKeyIsOk() throws BTChipException, UnreadableWalletException, IOException {
        BTChipDongle dongle = getDongle(true);

        byte[] publicKey = dongle.getGenuinenessKey();
        byte[] privateKey = ByteUtils.fromHexString("6c5544797a91115dc3330ebd003851d239a706ff2aa2ab70039c5510ddf06420");

        // Make curve to compare
        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);
        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
        ECCurve curve = dkRoot.getPubKeyPoint().getCurve();
        ECPoint point = curve.decodePoint(publicKey);

        ECKey key = ECKey.fromPrivate(privateKey, false);

        System.out.println(key.getPrivateKeyAsHex());
        System.out.println();

        assertEquals(ByteUtils.toHexString(key.getPubKey()), ByteUtils.toHexString(publicKey));

        assertEquals(ByteUtil.hexString(point.getEncoded(false)), ByteUtil.hexString(publicKey));

        String hash = "edfe77f05b19741c8908a5a05cb15f3dd3f4d0029b38b659e98d8a4c10e00bb9";
        byte[] challengeBytes = ByteUtil.byteArray(hash);

        ECKey.ECDSASignature signatureBitcoinJ = key.sign(Sha256Hash.wrap(challengeBytes));

        System.out.println(ByteUtils.toHexString(signatureBitcoinJ.encodeToDER()));
        System.out.println(signatureBitcoinJ.r);
        System.out.println(signatureBitcoinJ.s);
        System.out.println(signatureBitcoinJ.isCanonical());

        ECKey.ECDSASignature signatureBitcoinJCopy = ECKey.ECDSASignature.decodeFromDER(signatureBitcoinJ.encodeToDER());

        System.out.println(ByteUtils.toHexString(signatureBitcoinJCopy.encodeToDER()));
        System.out.println(signatureBitcoinJCopy.r);
        System.out.println(signatureBitcoinJCopy.s);
        System.out.println(signatureBitcoinJCopy.isCanonical());

        assertTrue(key.verify(Sha256Hash.wrap(challengeBytes), signatureBitcoinJ));
    }

    @Test
    public void testSignWithBitcoinj() throws BTChipException, UnreadableWalletException, IOException {
        BTChipDongle dongle = prepareDongleRestoreTestnet(true);

        String hash = "edfe77f05b19741c8908a5a05cb15f3dd3f4d0029b38b659e98d8a4c10e00bb9";
        byte[] challengeBytes = ByteUtil.byteArray(hash);

        byte[] publicKey = dongle.getGenuinenessKey();
        assertEquals(65, publicKey.length);
        System.out.println("PUBLIC:");
        System.out.println(ByteUtil.hexString(publicKey));

        byte[] signature = dongle.proveGenuineness(challengeBytes);
        signature = canonicalizeSignature(signature);

        ECKey.ECDSASignature signatureFromDER = ECKey.ECDSASignature.decodeFromDER(signature);

        System.out.println("SIGNATURE:");
        System.out.println(ByteUtil.hexString(signature));

        System.out.println("SIGNATURE FROM DER:");
        System.out.println(ByteUtils.toHexString(signatureFromDER.encodeToDER()));
        System.out.println(signatureFromDER.r);
        System.out.println(signatureFromDER.s);
        System.out.println(signatureFromDER.isCanonical());

        byte[] privateKey = ByteUtils.fromHexString("6c5544797a91115dc3330ebd003851d239a706ff2aa2ab70039c5510ddf06420");

        ECKey key = ECKey.fromPrivate(privateKey, false);
        assertTrue(key.verify(Sha256Hash.wrap(challengeBytes), signatureFromDER));
    }

    @Test
    public void testProveGenuinenessKey() throws BTChipException, UnreadableWalletException, IOException, NativeSecp256k1Util.AssertFailException {
        BTChipDongle dongle = prepareDongleRestoreTestnet(true);

        String hash = "edfe77f05b19741c8908a5a05cb15f3dd3f4d0029b38b659e98d8a4c10e00bb9";
        byte[] challengeBytes = ByteUtil.byteArray(hash);

        byte[] publicKey = dongle.getGenuinenessKey();
        assertEquals(65, publicKey.length);
        System.out.println("PUBLIC:");
        System.out.println(ByteUtil.hexString(publicKey));

        byte[] signature = dongle.proveGenuineness(challengeBytes);
        signature = canonicalizeSignature(signature);

        System.out.println("SIGNATURE:");
        System.out.println(ByteUtil.hexString(signature));

        ECPublicKey publicKeyEC = (ECPublicKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PUBLIC, KeyBuilder.LENGTH_EC_FP_256, false);
        assertTrue(Secp256k1.setCommonCurveParameters(publicKeyEC));

        Signature signatureEC = Signature.getInstance(Signature.ALG_ECDSA_SHA_256, false);

        publicKeyEC.setW(publicKey, (short)0, (short)65);
        signatureEC.init(publicKeyEC, Signature.MODE_VERIFY);
        try {
//            ECKey.ECDSASignature signatureDecoded = ECKey.ECDSASignature.decodeFromDER(signature);
//            ECDSASigner signer = new ECDSASigner();
//            ECPublicKeyParameters params = new ECPublicKeyParameters(CURVE.getCurve().decodePoint(publicKey), CURVE);
//            signer.init(false, params);
//            assertTrue(signer.verifySignature(challengeBytes, signatureDecoded.r, signatureDecoded.s));

            assertTrue(signatureEC.verify(challengeBytes, (short)0, (short)32, signature, (short)0, (short)signature.length));
        } catch(Exception e) {
            fail();
        }

        // Check if the public key changed after we signed (there was a bug, now fixed)
        byte[] publicKeyRecheck = dongle.getGenuinenessKey();
        assertEquals(65, publicKeyRecheck.length);
        assertEquals(ByteUtil.hexString(publicKey), ByteUtil.hexString(publicKeyRecheck));
    }
}
