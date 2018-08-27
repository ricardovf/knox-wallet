package com.knox.playground.basic;

import com.licel.jcardsim.crypto.AsymmetricSignatureImpl;
import com.licel.jcardsim.crypto.KeyAgreementImpl;
import com.licel.jcardsim.utils.ByteUtil;
import javacard.security.ECPrivateKey;
import javacard.security.KeyAgreement;
import javacard.security.KeyBuilder;
import javacard.security.Key;
import javacard.security.Signature;

public class JCardSIMProprietaryAPI implements ProprietaryAPI {

    private Signature signature;
    private KeyAgreement keyAgreement;
    private ECPrivateKey privateKey;
    private byte ecAlgorithm;


    public JCardSIMProprietaryAPI() {
        try {
//            keyAgreement = com.licel.jcardsim.extensions.security.KeyAgreement.getInstance(com.licel.jcardsim.extensions.security.KeyAgreement.ALG_EC_SVDP_DH_PLAIN_XY, false);
//            signature = com.licel.jcardsim.extensions.security.Signature.getInstance(com.licel.jcardsim.extensions.security.Signature.ALG_ECDSA_SHA_256_RFC6979, false);

            keyAgreement = com.licel.jcardsim.crypto.KeyAgreementImpl.getInstance(KeyAgreement.ALG_EC_SVDP_DH_PLAIN_XY, false);
            signature = com.licel.jcardsim.crypto.AsymmetricSignatureImpl.getInstance(Signature.ALG_ECDSA_SHA_256, false);
        } catch(Exception e) {
//            System.out.println("Erro ao criar keyAgreement e signature");
//            System.out.println(e);
        }

        try {
            privateKey = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_DESELECT, KeyBuilder.LENGTH_EC_FP_256, false);
            ecAlgorithm = KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_DESELECT;
        } catch(Exception e) {
//            System.out.println("Erro ao criar privateKey e ecAlgorithm (1 tentativa)");
//            System.out.println(e);

            try {
                privateKey = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_RESET, KeyBuilder.LENGTH_EC_FP_256, false);
                ecAlgorithm = KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_RESET;
            } catch(Exception e1) {
//                System.out.println("Erro ao criar privateKey e ecAlgorithm (2 tentativa)");
//                System.out.println(e1);

                try {
                    privateKey = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE, KeyBuilder.LENGTH_EC_FP_256, false);
                    ecAlgorithm = KeyBuilder.TYPE_EC_FP_PRIVATE;
                } catch(Exception e2) {
//                    System.out.println("Erro ao criar privateKey e ecAlgorithm (3 tentativa)");
//                    System.out.println(e2);
                }
            }
        }

        if ((privateKey != null) && (ecAlgorithm == KeyBuilder.TYPE_EC_FP_PRIVATE)) {
            Secp256k1.setCommonCurveParameters(privateKey);
        }
    }

//    @Override
    public boolean getUncompressedPublicPoint(byte[] privateKey,
                                              short privateKeyOffset, byte[] publicPoint, short publicPointOffset) {
        if ((privateKey != null) && (keyAgreement != null)) {
            try {
                if (ecAlgorithm != KeyBuilder.TYPE_EC_FP_PRIVATE) {
                    Secp256k1.setCommonCurveParameters(this.privateKey);
                }
                this.privateKey.setS(privateKey, privateKeyOffset, (short)32);
                keyAgreement.init(this.privateKey);
                keyAgreement.generateSecret(Secp256k1.SECP256K1_G, (short)0, (short)Secp256k1.SECP256K1_G.length, publicPoint, publicPointOffset);
                return true;
            }
            catch(Exception e) {
                return false;
            }
        }
        else {
            return false;
        }
    }

//    @Override
    public boolean hasHmacSHA512() {
        return false;
    }


//    @Override
    public void hmacSHA512(Key key, byte[] in, short inBuffer, short inLength, byte[] out, short outOffset) {
    }

//    @Override
    public boolean hasDeterministicECDSASHA256() {
        return true;
    }

//    @Override
    public void signDeterministicECDSASHA256(Key key, byte[] in, short inBuffer, short inLength, byte[] out, short outOffset) {
        signature.init(key, Signature.MODE_SIGN);
        signature.sign(in, inBuffer, inLength, out, outOffset);
    }
}