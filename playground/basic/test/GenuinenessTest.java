package com.knox.playground.basic;//package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import com.licel.jcardsim.bouncycastle.asn1.ASN1Sequence;
import com.licel.jcardsim.bouncycastle.asn1.DERInteger;
import com.licel.jcardsim.utils.ByteUtil;
import org.bitcoinj.core.ECKey;
import org.bitcoinj.core.NetworkParameters;
import org.bitcoinj.core.Sha256Hash;
import org.bitcoinj.crypto.ChildNumber;
import org.bitcoinj.crypto.DeterministicKey;
import org.bitcoinj.crypto.HDKeyDerivation;
import org.bitcoinj.params.TestNet3Params;
import org.bitcoinj.wallet.DeterministicSeed;
import org.bitcoinj.wallet.UnreadableWalletException;
import org.junit.Test;

import java.io.IOException;
import java.math.BigInteger;

import static org.junit.Assert.assertTrue;

public class GenuinenessTest extends AbstractJavaCardTest {
    @Test
    public void testGetPublicKey() throws BTChipException, UnreadableWalletException, IOException {
        Sha256Hash hash = Sha256Hash.wrap(ByteUtil.byteArray("edfe77f05b19741c8908a5a05cb15f3dd3f4d0029b38b659e98d8a4c10e00bb9"));

        BTChipDongle dongle = prepareDongleRestoreTestnet(true);
        dongle.verifyPin(DEFAULT_PIN);
        assertTrue(dongle.signTransactionPrepare("44'/0'/0'/0/0", hash.getBytes()));
        byte[] signature = dongle.signTransaction();
        ASN1Sequence seq = (ASN1Sequence)ASN1Sequence.fromByteArray(signature);
        BigInteger r = ((DERInteger)seq.getObjectAt(0)).getValue();
        BigInteger s = ((DERInteger)seq.getObjectAt(1)).getValue();
        if (s.compareTo(HALF_ORDER) > 0) {
            s = ORDER.subtract(s);
        }
//        ASN1Sequence seq = (ASN1Sequence)ASN1Sequence.fromByteArray(signature.getSignature());
//        BigInteger r = ((DERInteger)seq.getObjectAt(0)).getValue();
//        BigInteger s = ((DERInteger)seq.getObjectAt(1)).getValue();
//        if (s.compareTo(HALF_ORDER) > 0) s = ORDER.subtract(s);

        // check signature
        NetworkParameters params = TestNet3Params.get();
        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);
        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
        DeterministicKey dk44H = HDKeyDerivation.deriveChildKey(dkRoot, 44 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H = HDKeyDerivation.deriveChildKey(dk44H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H = HDKeyDerivation.deriveChildKey(dk44H0H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H0 = HDKeyDerivation.deriveChildKey(dk44H0H0H, 0);
        DeterministicKey dk44H0H0H00 = HDKeyDerivation.deriveChildKey(dk44H0H0H0, 0);

        ECKey.ECDSASignature checkerSignature = new ECKey.ECDSASignature(r, s);

        System.out.println(ByteUtil.hexString(signature));
        System.out.println(ByteUtil.hexString(checkerSignature.encodeToDER()));
//        System.out.println(ByteUtil.hexString(dk44H0H0H00.getPubKey()));
        System.out.println(ByteUtil.hexString(dk44H0H0H00.serializePrivate(params)));
        BTChipDongle.BTChipPublicKey dPkey = dongle.getWalletPublicKey("44'/0'/0'/0/0");
//        System.out.println(ByteUtil.hexString(dPkey.getPublicKey()));
        System.out.println("PRIVADA:");
        System.out.println(ByteUtil.hexString(dk44H0H0H00.getSecretBytes()));
        System.out.println("PRIVADA END!");
        // 680C92E02778442F168AC956427CD6636DEE58241FEDD9381A3297CDE5D09DC5
//        assertTrue(dk44H0H0H00.verify(hash, dk44H0H0H00.sign(hash)));
//        assertTrue(dk44H0H0H00.verify(hash, checkerSignature));
//        assertTrue(dk44H0H0H00.verify(hash.getBytes(), checkerSignature.encodeToDER(), dk44H0H0H00.getPubKey()));
//        ECDSASigner signer = new ECDSASigner();
//        ECPublicKeyParameters curveParams = new ECPublicKeyParameters(ECKey.CURVE.getCurve().decodePoint(dk44H0H0H00.getPubKey()), ECKey.CURVE);
//        signer.init(false, curveParams);
//
//        try {
//            System.out.println( signer.verifySignature(hash.getBytes(), r, s));
//        } catch (NullPointerException var7) {
//            System.out.println("Caught NPE inside bouncy castle");
//            System.out.println(var7);
//        }
    }
}
