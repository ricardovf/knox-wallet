package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import org.bitcoinj.core.NetworkParameters;
import org.bitcoinj.crypto.ChildNumber;
import org.bitcoinj.crypto.DeterministicKey;
import org.bitcoinj.crypto.HDKeyDerivation;
import org.bitcoinj.params.TestNet3Params;
import org.bitcoinj.wallet.DeterministicSeed;
import org.bitcoinj.wallet.UnreadableWalletException;
import org.junit.Test;
import org.spongycastle.pqc.math.linearalgebra.ByteUtils;

import java.util.Arrays;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class Bip32Tests extends AbstractJavaCardTest {
    @Test
    public void fullPathBip32Bip44Test() throws BTChipException, UnreadableWalletException {
        NetworkParameters params = TestNet3Params.get();
//        NetworkParameters paramsBtc = MainNetParams.get();

        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);

        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
        DeterministicKey dk44H = HDKeyDerivation.deriveChildKey(dkRoot, 44 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H = HDKeyDerivation.deriveChildKey(dk44H, 1 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H = HDKeyDerivation.deriveChildKey(dk44H0H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H0 = HDKeyDerivation.deriveChildKey(dk44H0H0H, 0);
        DeterministicKey dk44H0H0H00 = HDKeyDerivation.deriveChildKey(dk44H0H0H0, 0);

        BTChipDongle dongle = prepareDongleRestoreTestnet(true);
        dongle.verifyPin(DEFAULT_PIN);
        BTChipDongle.BTChipPublicKey publicKey = dongle.getWalletPublicKey("44'/1'/0'/0/0");

        assertEquals(dk44H0H0H00.toAddress(params).toString(), publicKey.getAddress());
        assertEquals(ByteUtils.toHexString(publicKey.getPublicKey()), ByteUtils.toHexString(dk44H0H0H00.getPubKeyPoint().getEncoded(false)));
        assertTrue(Arrays.equals(publicKey.getChainCode(), dk44H0H0H00.getChainCode()));
        System.out.println(ByteUtils.toHexString(publicKey.getPublicKey()));

//        System.out.println("PRIVATE");
//        System.out.println(dk44H0H0H00.getPrivateKeyAsHex());
//        System.out.println(ByteUtils.toHexString(dk44H0H0H00.serializePrivate(params)));
    }
}