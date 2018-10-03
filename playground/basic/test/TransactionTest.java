package com.knox.playground.basic;//package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import com.licel.jcardsim.utils.ByteUtil;
import javacard.security.ECPublicKey;
import javacard.security.KeyBuilder;
import javacard.security.Signature;
import org.bitcoinj.wallet.UnreadableWalletException;
import org.junit.Test;
import org.spongycastle.pqc.math.linearalgebra.ByteUtils;

import java.io.IOException;

import static junit.framework.TestCase.fail;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class TransactionTest extends AbstractJavaCardTest {
    @Test
    public void testSign() throws BTChipException, UnreadableWalletException, IOException {
        String path = "44'/1'/0'/0/0";
        String hash = "edfe77f05b19741c8908a5a05cb15f3dd3f4d0029b38b659e98d8a4c10e00bb9";
        byte[] challengeBytes = ByteUtil.byteArray(hash);

        BTChipDongle dongle = prepareDongleRestoreTestnet(true);
        dongle.verifyPin(DEFAULT_PIN);
        assertTrue(dongle.signTransactionPrepare(path, challengeBytes));
        byte[] signature = dongle.signTransaction();
        System.out.println("SIGNATURE NORMAL");
        System.out.println(ByteUtil.hexString(signature));

        signature = canonicalizeSignature(signature);
        System.out.println("SIGNATURE CANONICAL");
        System.out.println(ByteUtil.hexString(signature));

        byte[] publicKey = dongle.getWalletPublicKey(path).getPublicKey();
        assertEquals(65, publicKey.length);
        System.out.println("ADDRESS");
        System.out.println(publicKey);
//        System.out.println(ByteUtil.hexString(dk44H0H0H00.getChainCode()));
//        System.out.println(ByteUtil.hexString(dk44H0H0H00.getPubKeyPoint().getEncoded()));
        System.out.println("PUBLIC");
        System.out.println(ByteUtils.toHexString(publicKey));



        ECPublicKey publicKeyEC = (ECPublicKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PUBLIC, KeyBuilder.LENGTH_EC_FP_256, false);
        Secp256k1.setCommonCurveParameters(publicKeyEC);
        Signature signatureEC = Signature.getInstance(Signature.ALG_ECDSA_SHA_256, false);
        publicKeyEC.setW(publicKey, (short)0, (short)65);
        signatureEC.init(publicKeyEC, Signature.MODE_VERIFY);
        try {
            assertTrue(signatureEC.verify(challengeBytes, (short)0, (short)32, signature, (short)0, (short)(signature.length)));
        } catch(Exception e) {
            fail();
        }
    }
}
