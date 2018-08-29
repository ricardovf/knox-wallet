package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import com.licel.jcardsim.utils.ByteUtil;
import javacard.framework.CardException;
import org.bitcoinj.core.NetworkParameters;
import org.bitcoinj.crypto.ChildNumber;
import org.bitcoinj.crypto.DeterministicKey;
import org.bitcoinj.crypto.HDKeyDerivation;
import org.bitcoinj.params.TestNet3Params;
import org.bitcoinj.wallet.DeterministicSeed;
import org.bitcoinj.wallet.UnreadableWalletException;
import org.junit.Test;

import java.util.Arrays;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class Bip32Tests extends AbstractJavaCardTest {
    public static final String EXPECTED_ADDRESS_1 = "mtVeEwnNwH23GuURg2MzPmzKPGzzgTe4vx";
    public static final byte[] EXPECTED_PUBLIC_KEY_1 = ByteUtil.byteArray("0475e55e9edef059e186c27610c15c611921ebe82306013519c227c114a3baca01921e222b8bba28c142480edba7efd19e7d8e58140e1b0b358dcf1bb7e5ef7129");
    public static final byte[] EXPECTED_CHAINCODE_1 = ByteUtil.byteArray("363e279a6f13e362bdceb6bcd4335b687cc6fdd5a31b3513afe45381af745348");

    public static final String EXPECTED_ADDRESS_1_CHANGE = "mgteEzPS6zEDpjNZAW84dCtatVLBiPNLYw";
    public static final byte[] EXPECTED_PUBLIC_KEY_1_CHANGE = ByteUtil.byteArray("047e6d32f58015e5867c65f5ff2bf7ba8a8124bc9109aa6e8bac4ccd051dadae19455e274a6887f779c177b1d7478eb6398dbbc1105f4db67a5811799e4f0710bd");
    public static final byte[] EXPECTED_CHAINCODE_1_CHANGE = ByteUtil.byteArray("28556239ec3cfa333f997561a602577dc26105b214d7d8458633b72063811487");

    @Test
    public void fullPathBip32Bip44Test() throws BTChipException {
        BTChipDongle dongle = prepareDongleRestoreTestnet(true);
        dongle.verifyPin(DEFAULT_PIN);
        BTChipDongle.BTChipPublicKey publicKey = dongle.getWalletPublicKey("44'/0'/0'/0/42");
        assertEquals(publicKey.getAddress(), EXPECTED_ADDRESS_1);
        assertTrue(Arrays.equals(publicKey.getPublicKey(), EXPECTED_PUBLIC_KEY_1));
        assertTrue(Arrays.equals(publicKey.getChainCode(), EXPECTED_CHAINCODE_1));

        BTChipDongle.BTChipPublicKey publicKeyChange = dongle.getWalletPublicKey("44'/0'/0'/1/42");
        assertEquals(publicKeyChange.getAddress(), EXPECTED_ADDRESS_1_CHANGE);
        assertTrue(Arrays.equals(publicKeyChange.getPublicKey(), EXPECTED_PUBLIC_KEY_1_CHANGE));
        assertTrue(Arrays.equals(publicKeyChange.getChainCode(), EXPECTED_CHAINCODE_1_CHANGE));
    }


}