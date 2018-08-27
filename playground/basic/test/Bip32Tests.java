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
    private final static byte[] CMD_HELLO = new byte[]{0x00, 0x01, 0x00, 0x00};

    public static final String EXPECTED_ADDRESS_1 = "mtVeEwnNwH23GuURg2MzPmzKPGzzgTe4vx";
    public static final byte[] EXPECTED_PUBLIC_KEY_1 = ByteUtil.byteArray("0475e55e9edef059e186c27610c15c611921ebe82306013519c227c114a3baca01921e222b8bba28c142480edba7efd19e7d8e58140e1b0b358dcf1bb7e5ef7129");
    public static final byte[] EXPECTED_CHAINCODE_1 = ByteUtil.byteArray("363e279a6f13e362bdceb6bcd4335b687cc6fdd5a31b3513afe45381af745348");

//    @Before
//    public void initTest() throws CardException {
//        TestSuite.setup();
//    }

    @Test
    public void helloWorldTest() throws CardException, BTChipException, javax.smartcardio.CardException {
        BTChipDongle dongle = prepareDongleRestoreTestnet(true);
//        sendAPDUAndCheck(dongle, CMD_HELLO, new byte[]{}, 0x9000, "Hello world !".getBytes());
        dongle.verifyPin(DEFAULT_PIN);
        BTChipDongle.BTChipPublicKey publicKey = dongle.getWalletPublicKey("44'/0'/0'/0/42");
        assertEquals(publicKey.getAddress(), EXPECTED_ADDRESS_1);
        assertTrue(Arrays.equals(publicKey.getPublicKey(), EXPECTED_PUBLIC_KEY_1));
        assertTrue(Arrays.equals(publicKey.getChainCode(), EXPECTED_CHAINCODE_1));
    }

//    @Test
    public void generateAddress() throws UnreadableWalletException {
        NetworkParameters params = TestNet3Params.get();

        DeterministicSeed seed = new DeterministicSeed(new String(DEFAULT_SEED_WORDS), null, "", 1409478661L);

//        Wallet wallet = Wallet.fromSeed(params, seed);

        DeterministicKey dkRoot = HDKeyDerivation.createMasterPrivateKey(seed.getSeedBytes());
        DeterministicKey dk44H = HDKeyDerivation.deriveChildKey(dkRoot, 44 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H = HDKeyDerivation.deriveChildKey(dk44H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H = HDKeyDerivation.deriveChildKey(dk44H0H, 0 | ChildNumber.HARDENED_BIT);
        DeterministicKey dk44H0H0H0 = HDKeyDerivation.deriveChildKey(dk44H0H0H, 0);
        DeterministicKey dk44H0H0H042 = HDKeyDerivation.deriveChildKey(dk44H0H0H0, 42);

        System.out.println(dk44H0H0H042.toAddress(params));
    }
}