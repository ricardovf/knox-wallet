//package com.knox.playground.basic;
//
//import javacard.security.*;
//import com.nxp.id.jcopx.KeyAgreementX;
////import com.nxp.id.jcopx.SignatureX;
//
//public class JCOPProprietaryAPI implements ProprietaryAPI {
//
//    private Signature signature;
//    private KeyAgreement keyAgreement;
//    private ECPrivateKey privateKey;
//    private byte ecAlgorithm;
//
//
//    public JCOPProprietaryAPI() {
//        try {
//            keyAgreement = KeyAgreementX.getInstance(KeyAgreementX.ALG_EC_SVDP_DH_PLAIN_XY, false);
//        } catch(Exception e) {
//        }
//
////        try {
////            signature = SignatureX.getInstance(Signature.ALG_ECDSA_SHA_256, false);
////        } catch(Exception e) {
////        }
//
//        try {
//            privateKey = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_DESELECT, KeyBuilder.LENGTH_EC_FP_256, false);
//            ecAlgorithm = KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_DESELECT;
//        } catch(Exception e) {
//            try {
//                privateKey = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_RESET, KeyBuilder.LENGTH_EC_FP_256, false);
//                ecAlgorithm = KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_RESET;
//            } catch(Exception e1) {
//                try {
//                    privateKey = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE, KeyBuilder.LENGTH_EC_FP_256, false);
//                    ecAlgorithm = KeyBuilder.TYPE_EC_FP_PRIVATE;
//                } catch(Exception e2) {
//                }
//            }
//        }
//
//        if ((privateKey != null) && (ecAlgorithm == KeyBuilder.TYPE_EC_FP_PRIVATE)) {
//            Secp256k1.setCommonCurveParameters(privateKey);
//        }
//    }
//
//    public boolean isSimulator() {
//        return false;
//    }
//
//    public boolean getUncompressedPublicPoint(byte[] privateKey,
//                                              short privateKeyOffset, byte[] publicPoint, short publicPointOffset) {
//        if ((privateKey != null) && (keyAgreement != null)) {
//            try {
//                if (ecAlgorithm != KeyBuilder.TYPE_EC_FP_PRIVATE) {
//                    Secp256k1.setCommonCurveParameters(this.privateKey);
//                }
//                this.privateKey.setS(privateKey, privateKeyOffset, (short)32);
//                keyAgreement.init(this.privateKey);
//                keyAgreement.generateSecret(Secp256k1.SECP256K1_G, (short)0, (short)Secp256k1.SECP256K1_G.length, publicPoint, publicPointOffset);
////                keyAgreement.generateSecret(Secp256k1.SECP256K1_G, (short)0, (short) 65, publicPoint, publicPointOffset);
//                return true;
//            }
//            catch(Exception e) {
//                return false;
//            }
//        } else {
//            return false;
//        }
//    }
//
//    public boolean hasHmacSHA512() {
//        return false;
//    }
//
//
//    public void hmacSHA512(Key key, byte[] in, short inBuffer, short inLength, byte[] out, short outOffset) {
//    }
//
//    public boolean hasDeterministicECDSASHA256() {
//        return false;
//    }
//
//    public void signDeterministicECDSASHA256(Key key, byte[] in, short inBuffer, short inLength, byte[] out, short outOffset) {
////        signature.init(key, Signature.MODE_SIGN);
////        signature.sign(in, inBuffer, inLength, out, outOffset);
//    }
//}