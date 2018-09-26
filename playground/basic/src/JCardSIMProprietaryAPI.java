package com.knox.playground.basic;

import javacard.security.*;

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
        } else {
            return false;
        }
    }

    public boolean hasHmacSHA512() {
        return false;
    }


    public void hmacSHA512(Key key, byte[] in, short inBuffer, short inLength, byte[] out, short outOffset) {
    }

    public boolean hasDeterministicECDSASHA256() {
        return false;
    }

    public void signDeterministicECDSASHA256(Key key, byte[] in, short inBuffer, short inLength, byte[] out, short outOffset) {
        signature.init(key, Signature.MODE_SIGN);
        signature.sign(in, inBuffer, inLength, out, outOffset);
    }
}