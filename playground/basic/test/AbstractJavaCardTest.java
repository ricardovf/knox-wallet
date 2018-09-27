package com.knox.playground.basic;

import com.knox.playground.basic.server.AbstractDongleInteraction;
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

abstract public class AbstractJavaCardTest extends AbstractDongleInteraction {
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
}