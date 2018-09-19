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
    public static final byte[] DEFAULT_SEED_WORDS = "release afford clump fury license speak hungry remain crouch exile basic choose bar client own clip like armor forum fossil energy eight seven sausage".getBytes();
    public static final byte[] DEFAULT_SEED = ByteUtil.byteArray("d3c9b5146da60ebb8216ced62ecfc3a7dd3c7dc98f41a35e841cd5a659f0991bb7562be0d1138b2a5df2512004c8374162a2970d2a1277001f6614172e44f033");
    public static final byte DEFAULT_KEYCARD_ADDRESS_SIZE = (byte) 4;
    public static final byte[] DEFAULT_KEYCARD = ByteUtil.byteArray("f27c395759a14d3aec2135188d670d8e");

    protected CardSimulator simulator;
}