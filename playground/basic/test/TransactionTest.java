package com.knox.playground.basic;//package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import com.licel.jcardsim.utils.ByteUtil;
import javacard.security.ECPublicKey;
import javacard.security.KeyBuilder;
import javacard.security.Signature;
import org.bitcoinj.core.ECKey;
import org.bitcoinj.core.Sha256Hash;
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
        byte[] publicKey = dongle.getWalletPublicKey(path).getPublicKey();

        ECKey.ECDSASignature signatureFromDER = ECKey.ECDSASignature.decodeFromDER(signature);

        System.out.println("SIGNATURE:");
        System.out.println(ByteUtil.hexString(signature));

        System.out.println("SIGNATURE FROM DER:");
        System.out.println(ByteUtils.toHexString(signatureFromDER.encodeToDER()));
        System.out.println(signatureFromDER.r);
        System.out.println(signatureFromDER.s);
        System.out.println(signatureFromDER.isCanonical());

        // Check using public key
        ECKey keyPub = ECKey.fromPublicOnly(publicKey);
        assertTrue(keyPub.verify(Sha256Hash.wrap(challengeBytes), signatureFromDER));
    }
}
