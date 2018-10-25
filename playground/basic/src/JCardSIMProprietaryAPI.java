package com.knox.playground.basic;

import javacard.framework.Util;
import javacard.security.*;
import org.bitcoinj.core.ECKey;
import org.bitcoinj.core.Sha256Hash;
import org.spongycastle.pqc.math.linearalgebra.ByteUtils;

public class JCardSIMProprietaryAPI implements ProprietaryAPI {

    private Signature signature;
    private KeyAgreement keyAgreement;
    private ECPrivateKey privateKey;
    private byte ecAlgorithm;
//    public ECConfig ecc = null;
//    public ECCurve curve = null;
//    ECPoint point1 = null;
//    ECPoint point2 = null;

//    final static byte[] ECPOINT_TEST_VALUE = {(byte)0x04, (byte) 0x3B, (byte) 0xC1, (byte) 0x5B, (byte) 0xE5, (byte) 0xF7, (byte) 0x52, (byte) 0xB3, (byte) 0x27, (byte) 0x0D, (byte) 0xB0, (byte) 0xAE, (byte) 0xF2, (byte) 0xBC, (byte) 0xF0, (byte) 0xEC, (byte) 0xBD, (byte) 0xB5, (byte) 0x78, (byte) 0x8F, (byte) 0x88, (byte) 0xE6, (byte) 0x14, (byte) 0x32, (byte) 0x30, (byte) 0x68, (byte) 0xC4, (byte) 0xC4, (byte) 0x88, (byte) 0x6B, (byte) 0x43, (byte) 0x91, (byte) 0x4C, (byte) 0x22, (byte) 0xE1, (byte) 0x67, (byte) 0x68, (byte) 0x3B, (byte) 0x32, (byte) 0x95, (byte) 0x98, (byte) 0x31, (byte) 0x19, (byte) 0x6D, (byte) 0x41, (byte) 0x88, (byte) 0x0C, (byte) 0x9F, (byte) 0x8C, (byte) 0x59, (byte) 0x67, (byte) 0x60, (byte) 0x86, (byte) 0x1A, (byte) 0x86, (byte) 0xF8, (byte) 0x0D, (byte) 0x01, (byte) 0x46, (byte) 0x0C, (byte) 0xB5, (byte) 0x8D, (byte) 0x86, (byte) 0x6C, (byte) 0x09};

//    final static byte[] SCALAR_TEST_VALUE = {(byte) 0xE8, (byte) 0x05, (byte) 0xE8, (byte) 0x02, (byte) 0xBF, (byte) 0xEC, (byte) 0xEE, (byte) 0x91, (byte) 0x9B, (byte) 0x3D, (byte) 0x3B, (byte) 0xD8, (byte) 0x3C, (byte) 0x7B, (byte) 0x52, (byte) 0xA5, (byte) 0xD5, (byte) 0x35, (byte) 0x4C, (byte) 0x4C, (byte) 0x06, (byte) 0x89, (byte) 0x80, (byte) 0x54, (byte) 0xB9, (byte) 0x76, (byte) 0xFA, (byte) 0xB1, (byte) 0xD3, (byte) 0x5A, (byte) 0x10, (byte) 0x91};

    public JCardSIMProprietaryAPI() {
        // Pre-allocate all helper structures
//        ecc = new ECConfig((short) 256);
        // Pre-allocate standard Secp256k1 curve and two EC points on this curve
//        curve = new ECCurve(true, Secp256k1.SECP256K1_FP, Secp256k1.SECP256K1_A, Secp256k1.SECP256K1_B, Secp256k1.SECP256K1_G, Secp256k1.SECP256K1_R);
//        point1 = new ECPoint(curve, ecc.ech);
//        point2 = new ECPoint(curve, ecc.ech);
//        point2 = new ECPoint(curve, ecc.ech);

        try {
//            keyAgreement = com.licel.jcardsim.extensions.security.KeyAgreement.getInstance(com.licel.jcardsim.extensions.security.KeyAgreement.ALG_EC_SVDP_DH_PLAIN_XY, false);
//            signature = com.licel.jcardsim.extensions.security.Signature.getInstance(com.licel.jcardsim.extensions.security.Signature.ALG_ECDSA_SHA_256_RFC6979, false);

            keyAgreement = com.licel.jcardsim.crypto.KeyAgreementImpl.getInstance(KeyAgreement.ALG_EC_SVDP_DH_PLAIN_XY, false);
            signature = com.licel.jcardsim.crypto.AsymmetricSignatureImpl.getInstance(Signature.ALG_ECDSA_SHA_256, false);
        } catch(Exception e) {
            System.out.println("Erro ao criar keyAgreement e signature: ALG_EC_SVDP_DH_PLAIN_XY, ALG_ECDSA_SHA_256");
            System.out.println(e);
        }

        try {
            privateKey = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_DESELECT, KeyBuilder.LENGTH_EC_FP_256, false);
            ecAlgorithm = KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_DESELECT;
        } catch(Exception e) {
//            System.out.println("Erro ao criar privateKey e ecAlgorithm (LENGTH_EC_FP_256 - TYPE_EC_FP_PRIVATE_TRANSIENT_DESELECT)");

            try {
                privateKey = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_RESET, KeyBuilder.LENGTH_EC_FP_256, false);
                ecAlgorithm = KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_RESET;
            } catch(Exception e1) {
//                System.out.println("Erro ao criar privateKey e ecAlgorithm (LENGTH_EC_FP_256 - TYPE_EC_FP_PRIVATE_TRANSIENT_RESET)");

                try {
                    privateKey = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE, KeyBuilder.LENGTH_EC_FP_256, false);
                    ecAlgorithm = KeyBuilder.TYPE_EC_FP_PRIVATE;
                } catch(Exception e2) {
//                    System.out.println("Erro ao criar privateKey e ecAlgorithm (LENGTH_EC_FP_256 - TYPE_EC_FP_PRIVATE)");
                }
            }
        }

        if ((privateKey != null) && (ecAlgorithm == KeyBuilder.TYPE_EC_FP_PRIVATE)) {
            Secp256k1.setCommonCurveParameters(privateKey);
        }
    }

    public boolean isSimulator() {
        return true;
    }

    public boolean getUncompressedPublicPoint(byte[] privateKey,
                                              short privateKeyOffset, byte[] publicPoint, short publicPointOffset) {

        if ((privateKey != null) && (keyAgreement != null)) {
            try {
                // Generate first point at random
//                point1.setA(Secp256k1.SECP256K1_G, (short) 2, (short) 16);
//                point1.setB(Secp256k1.SECP256K1_G, (short) 18, (short) 16);
                // Set second point to predefined value
//                point2.setW(Secp256k1.SECP256K1_G, (short) 0, (short) Secp256k1.SECP256K1_G.length);
                // Add two points together
//                point1.add(point2);
                // Multiply point by large scalar
//                point1.multiplication(privateKey, privateKeyOffset, (short) 32);

                //point1.setW(Secp256k1.SECP256K1_G, (short)0, (short) Secp256k1.SECP256K1_G.length);
//                point1.multiplication(SCALAR_TEST_VALUE, (short) 0, (short) SCALAR_TEST_VALUE.length);
//                System.out.println("Chave gerada:");
//                point1.getX(publicPoint, (short)(publicPointOffset+1));
//                point1.getY(publicPoint, (short)(publicPointOffset + 1 + curve.COORD_SIZE));

                // Add 0x04 to the start of the public key
//                Util.arrayFillNonAtomic(publicPoint, publicPointOffset, (short)1, (byte)0x04);

                //point1.getY(publicPoint, publicPointOffset);

//                System.out.println(ByteUtils.toHexString(publicPoint));

//                return true;
//                Bignat privKey = new BigInteger(privateKey,16);
//                X9ECParameters ecp = SECNamedCurves.getByName("secp256k1");
//                ECPoint curvePt = ecp.getG().multiply(privKey);
//                BigInteger x = curvePt.getXCoord().toBigInteger();
//                BigInteger y = curvePt.getYCoord().toBigInteger();
//                byte[] xBytes = this.removeSignByte(x.toByteArray());
//                byte[] yBytes = this.removeSignByte(y.toByteArray());
//                byte[] pubKeyBytes = new byte[65];
//                pubKeyBytes[0] = new Byte("04");
//                System.arraycopy(xBytes,0, pubKeyBytes, 1, xBytes.length);
//                System.arraycopy(yBytes, 0, pubKeyBytes, 33, yBytes.length);
//                return this.bytesToHex(pubKeyBytes);}

//                point1.setG(privateKey, privateKeyOffset, (short)privateKey.length);
//                point2.setW(ECPOINT_TEST_VALUE, (short) 0, (short) ECPOINT_TEST_VALUE.length); // Set second point to predefined value
//                point1.add(point2); // Add two points together
//                point1.multiplication(privateKey, privateKeyOffset, (short)privateKey.length);
//                point1.asPublicKey()


//                if (ecAlgorithm != KeyBuilder.TYPE_EC_FP_PRIVATE) {
//                    Secp256k1.setCommonCurveParameters(this.privateKey);
//                }
//                this.privateKey.setS(privateKey, privateKeyOffset, (short)32);
//                point1.multiplication(privateKey, privateKeyOffset, (short)32);
//                point1.getW(publicPoint, publicPointOffset);

                        // // Then calculate the public key only using domainParams.getG() and private key
                //    ECPoint Q = domainParams.getG().multiply(new BigInteger(privateKeyBytes));
                //    System.out.println("Calculated public key: " + toHex(Q.getEncoded(true)));
//                keyAgreement.init(this.privateKey);
//                keyAgreement.generateSecret(Secp256k1.SECP256K1_G, (short)0, (short)Secp256k1.SECP256K1_G.length, publicPoint, publicPointOffset);


                // ORIGINAL
                if (ecAlgorithm != KeyBuilder.TYPE_EC_FP_PRIVATE) {
                    Secp256k1.setCommonCurveParameters(this.privateKey);
                }
                this.privateKey.setS(privateKey, privateKeyOffset, (short)32);
                keyAgreement.init(this.privateKey);
                keyAgreement.generateSecret(Secp256k1.SECP256K1_G, (short)0, (short)Secp256k1.SECP256K1_G.length, publicPoint, publicPointOffset);

                return true;
            }
            catch(Exception e) {
                System.out.println(e);
                return false;
            }
        } else {
            return false;
        }
    }

//    final protected static char[] hexArray = "0123456789ABCDEF".toCharArray();
//
//    public String bytesToHex(byte[] bytes) {
//        char[] hexChars = new char[bytes.length * 2];
//        int v;
//        for ( int j = 0; j < bytes.length; j++ ) {
//            v = bytes[j] & 0xFF;
//            hexChars[j * 2] = hexArray[v >>> 4];
//            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
//        }
//        return new String(hexChars);
//    }
//
//    protected byte[] removeSignByte(byte[] arr)
//    {
//        if(arr.length==33)
//        {
//            byte[] newArr = new byte[32];
//            System.arraycopy(arr, 1, newArr, 0, newArr.length);
//            return newArr;
//        }
//        return arr;
//    }

    public boolean hasHmacSHA512() {
        return false;
    }


    public void hmacSHA512(Key key, byte[] in, short inBuffer, short inLength, byte[] out, short outOffset) {
    }

    public boolean hasDeterministicECDSASHA256() {
        return true;
    }

    public void signDeterministicECDSASHA256(byte[] keyBuffer, short keyOffset, byte[] dataBuffer, short dataOffset, byte[] targetBuffer, short targetOffset) {
        byte[] key = new byte[32];
        Util.arrayCopyNonAtomic(keyBuffer, keyOffset, key, (short) 0, (short)32);

        System.out.println("Chave privada:");
        System.out.println(ByteUtils.toHexString(key));

        byte[] hash = new byte[32];
        Util.arrayCopyNonAtomic(dataBuffer, dataOffset, hash, (short) 0, (short)32);

        org.bitcoinj.core.ECKey localKey = ECKey.fromPrivate(key, false);
//        System.out.println(localKey.toStringWithPrivate());
        System.out.println(ByteUtils.toHexString(localKey.getPrivKeyBytes()));
        System.out.println(localKey.getPrivateKeyAsHex());

        ECKey.ECDSASignature sig = localKey.sign(Sha256Hash.wrap(hash));

        byte[] der = sig.encodeToDER();

        Crypto.fixS(der, (short)0);

        Util.arrayCopyNonAtomic(der, (short)0, targetBuffer, targetOffset, (short)der.length);

//        OLD METHOD
//        Crypto.initTransientPrivate(keyBuffer, keyOffset);
//        signature.init(key, Signature.MODE_SIGN);
//        signature.sign(in, inBuffer, inLength, out, outOffset);
//        if (Crypto.transientPrivateTransient) {
//            Crypto.transientPrivate.clearKey();
//        }
    }

    public boolean verifyECDSASHA256(byte[] keyBuffer, short keyOffset, byte[] dataBuffer, short dataOffset, byte[] signatureBuffer, short signatureOffset) {
        byte[] key = new byte[65];
        Util.arrayCopyNonAtomic(keyBuffer, keyOffset, key, (short) 0, (short)65);

        byte[] hash = new byte[32];
        Util.arrayCopyNonAtomic(dataBuffer, dataOffset, hash, (short) 0, (short)32);

        short sigLength = (short)(signatureBuffer[(short)(signatureOffset + 1)] + 2);
        byte[] sigBytes = new byte[sigLength];
//        sigBytes[0] = (byte)0x30;
        Util.arrayCopyNonAtomic(signatureBuffer, signatureOffset, sigBytes, (short) 0, sigLength);
        System.out.println(ByteUtils.toHexString(sigBytes));

        org.bitcoinj.core.ECKey localKey = ECKey.fromPublicOnly(key);
        ECKey.ECDSASignature sig = ECKey.ECDSASignature.decodeFromDER(sigBytes);

        return localKey.verify(Sha256Hash.wrap(hash), sig);
    }
}