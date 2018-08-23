package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import com.licel.jcardsim.utils.ByteUtil;
import org.junit.Test;

import javax.smartcardio.CardException;

import java.util.Arrays;

import static org.junit.Assert.assertArrayEquals;
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
//
    @Test
    public void helloWorldTest() throws CardException, BTChipException {
        BTChipDongle dongle = prepareDongleRestoreTestnet(true);
        sendAPDUAndCheck(dongle, CMD_HELLO, new byte[]{}, 0x9000, "Hello world !".getBytes());
//        dongle.verifyPin(DEFAULT_PIN);
//        BTChipDongle.BTChipPublicKey publicKey = dongle.getWalletPublicKey("44'/0'/0'/0/42");
//        assertEquals(publicKey.getAddress(), EXPECTED_ADDRESS_1);
//        assertTrue(Arrays.equals(publicKey.getPublicKey(), EXPECTED_PUBLIC_KEY_1));
//        assertTrue(Arrays.equals(publicKey.getChainCode(), EXPECTED_CHAINCODE_1));
    }
}