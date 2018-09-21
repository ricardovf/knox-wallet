package com.knox.playground.basic;//package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import com.licel.jcardsim.bouncycastle.asn1.ASN1Sequence;
import com.licel.jcardsim.bouncycastle.asn1.DERInteger;
import com.licel.jcardsim.utils.ByteUtil;
import javacard.security.KeyBuilder;
import javacard.security.Signature;
import org.bitcoin.NativeSecp256k1Util;
import org.bitcoinj.core.ECKey;
import org.bitcoinj.crypto.LazyECPoint;
import org.bitcoinj.wallet.UnreadableWalletException;
import org.junit.Test;
import org.spongycastle.crypto.params.ECPublicKeyParameters;
import org.spongycastle.crypto.signers.ECDSASigner;

import java.io.IOException;
import java.math.BigInteger;
import javacard.security.ECPublicKey;

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

        System.out.println(ByteUtil.hexString(publicKey));
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
