package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipConstants;
import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import com.licel.jcardsim.bouncycastle.asn1.ASN1EncodableVector;
import com.licel.jcardsim.bouncycastle.asn1.ASN1Sequence;
import com.licel.jcardsim.bouncycastle.asn1.DERInteger;
import com.licel.jcardsim.bouncycastle.asn1.DERSequence;
import com.licel.jcardsim.smartcardio.CardSimulator;
import com.licel.jcardsim.utils.AIDUtil;
import com.licel.jcardsim.utils.ByteUtil;
import javacard.framework.AID;

import javax.smartcardio.CardException;
import javax.smartcardio.ResponseAPDU;
import java.math.BigInteger;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

abstract public class AbstractJavaCardTest implements BTChipConstants {
    protected BTChipDongle prepareDongleRestoreTestnet(boolean debug) throws BTChipException {
        BTChipDongle dongle = getDongle(debug);
        dongle.setup(
            new BTChipDongle.OperationMode[]{BTChipDongle.OperationMode.DEVELOPER},
            TESTNET_VERSION,
            TESTNET_P2SH_VERSION,
            DEFAULT_PIN,
            DEFAULT_SEED);
        return dongle;
    }

    protected BTChipDongle prepareDongle(boolean debug) throws BTChipException {
        BTChipDongle dongle = getDongle(debug);
        dongle.setup(
                new BTChipDongle.OperationMode[]{BTChipDongle.OperationMode.WALLET},
                TESTNET_VERSION,
                TESTNET_P2SH_VERSION);
        return dongle;
    }

//    public ResponseAPDU transmitCommand(CommandAPDU data) throws CardException {
//        if (System.getProperty("testMode") != null && System.getProperty("testMode").equals("smartcard")) {
//            return TestSuite.getCard().getBasicChannel().transmit(data);
//        } else {
//            return TestSuite.getSimulator().transmitCommand(data);
//        }
//    }

    protected void sendAPDUAndCheck(BTChipDongle dongle, byte[] cmd, byte[] data, int expectedSw, byte[] expectedResponse) throws CardException, BTChipException {
        ResponseAPDU response = dongle.sendRawAPDU(cmd, data);
//        System.out.println("RESPONSE: ".concat(ByteUtil.hexString(response.getBytes())));
//        System.out.println(response.getSW());
//        System.out.println(response.getData());
        assertEquals(expectedSw, response.getSW());
        assertArrayEquals(expectedResponse, response.getData());
    }

    protected CardSimulator prepareSimulator() {
//        byte[] parameters = new byte[INSTANCE_AID_DATA.length + 3];
//        parameters[0] = (byte)INSTANCE_AID_DATA.length;
//        System.arraycopy(INSTANCE_AID_DATA, 0, parameters, 1, INSTANCE_AID_DATA.length);
        CardSimulator tmpSimulator = new CardSimulator();
        tmpSimulator.installApplet(LOAD_FILE_AID, BasicWalletApplet.class);
//        tmpSimulator.installApplet(LOAD_FILE_AID, BasicWalletApplet.class, parameters, (short)0, (byte)parameters.length);
        return tmpSimulator;
    }

    protected BTChipDongle getDongle(boolean debug) throws BTChipException {
        this.simulator = prepareSimulator();
        this.simulator.changeProtocol("T=CL,TYPE_A,T1");
        assertTrue(simulator.selectApplet(LOAD_FILE_AID));
        JCardSIMTransport transport = new JCardSIMTransport(simulator, debug);
        BTChipDongle dongle = new BTChipDongle(transport);

        return dongle;
    }

    protected BTChipDongle getDongle() throws BTChipException {
        return getDongle(false);
    }

    protected void reset() throws BTChipException {
        simulator.reset();
        assertTrue(simulator.selectApplet(LOAD_FILE_AID));
    }

    protected byte[] canonicalizeSignature(byte[] signature) throws BTChipException {
        try {
            ASN1Sequence seq = (ASN1Sequence)ASN1Sequence.fromByteArray(signature);
            BigInteger r = ((DERInteger)seq.getObjectAt(0)).getValue();
            BigInteger s = ((DERInteger)seq.getObjectAt(1)).getValue();
            if (s.compareTo(HALF_ORDER) > 0) {
                s = ORDER.subtract(s);
            } else {
                return signature;
            }
            ASN1EncodableVector v = new ASN1EncodableVector();
            v.add(new DERInteger(r));
            v.add(new DERInteger(s));
            return new DERSequence(v).getEncoded("DER");
        }
        catch(Exception e) {
            throw new BTChipException("Error canonicalizing signature", e);
        }
    }

    protected static final BigInteger HALF_ORDER = new BigInteger(ByteUtil.byteArray("7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0"));
    protected static final BigInteger ORDER = new BigInteger(1, ByteUtil.byteArray("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"));

    public static final AID LOAD_FILE_AID = AIDUtil.create("f276a288bcfba69d34f310");
//    public static final byte[] INSTANCE_AID_DATA = ByteUtil.byteArray("FF4C4547522E57414C5430312E493031");
//    public static final AID INSTANCE_AID = AIDUtil.create(INSTANCE_AID_DATA);

    public static final int TESTNET_VERSION = 111;
    public static final int TESTNET_P2SH_VERSION = 196;

    public static final byte[] DEFAULT_PIN = "1234".getBytes();
    public static final byte[] ALTERNATIVE_PIN = "567898765".getBytes();

    // 1964, 368, 565, 1733, 262, 1749, 1978, 851, 1588, 1365, 356, 424, 1241, 62, 1548, 1289, 823, 1666, 1338, 1783, 638, 1634, 945, 1897
    public static final byte[] DEFAULT_SEED_WORDS = "void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold".getBytes();
    public static final byte[] DEFAULT_SEED_ENTROPY = ByteUtil.byteArray("f585c11aec520db57dd353c69554b21a89b20fb0650966fa0a9d6f74fd989d8f");
    public static final byte[] DEFAULT_SEED = ByteUtil.byteArray("b873212f885ccffbf4692afcb84bc2e55886de2dfa07d90f5c3c239abc31c0a6ce047e30fd8bf6a281e71389aa82d73df74c7bbfb3b06b4639a5cee775cccd3c");

    protected CardSimulator simulator;

    public static boolean[] bytesToBits(byte[] data) {
        boolean[] bits = new boolean[data.length * 8];

        for(int i = 0; i < data.length; ++i) {
            for(int j = 0; j < 8; ++j) {
                bits[i * 8 + j] = (data[i] & 1 << 7 - j) != 0;
            }
        }

        return bits;
    }
}