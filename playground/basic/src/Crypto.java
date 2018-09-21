/*
*******************************************************************************    
*   Java Card Bitcoin Hardware Wallet
*   (c) 2015 Ledger
*   
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as
*   published by the Free Software Foundation, either version 3 of the
*   License, or (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*******************************************************************************   
*/    
package com.knox.playground.basic;

import com.licel.jcardsim.utils.ByteUtil;
import javacard.framework.JCSystem;
import javacard.framework.Util;
import javacard.security.CryptoException;
import javacard.security.DESKey;
import javacard.security.AESKey;
import javacard.security.ECKey;
import javacard.security.ECPrivateKey;
import javacard.security.ECPublicKey;
import javacard.security.HMACKey;
import javacard.security.KeyAgreement;
import javacard.security.KeyBuilder;
import javacard.security.KeyPair;
import javacard.security.MessageDigest;
import javacard.security.RandomData;
import javacard.security.Signature;
import javacardx.crypto.Cipher;

/**
 * Hardware Wallet crypto tools
 * @author BTChip
 *
 */
public class Crypto {
	
	// Java Card constants might be off for some platforms - recheck with your implementation
	//private static final short HMAC_SHA512_SIZE = KeyBuilder.LENGTH_HMAC_SHA_512_BLOCK_128; 
	private static final short HMAC_SHA512_SIZE = (short)(32 * 8);
    
    public static void init() {
        scratch = JCSystem.makeTransientByteArray((short)1, JCSystem.CLEAR_ON_DESELECT);
        random = RandomData.getInstance(RandomData.ALG_KEYGENERATION);
        try {
            // ok, let's save RAM
            transientPrivate = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_DESELECT, KeyBuilder.LENGTH_EC_FP_256, false);
            transientPrivateTransient = true;
        }
        catch(CryptoException e) {
            try {
                // ok, let's save a bit less RAM
                transientPrivate = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE_TRANSIENT_RESET, KeyBuilder.LENGTH_EC_FP_256, false);
                transientPrivateTransient = true;
            }
            catch(CryptoException e1) {
                // ok, let's test the flash wear leveling \o/
                transientPrivate = (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE, KeyBuilder.LENGTH_EC_FP_256, false);
                Secp256k1.setCommonCurveParameters(transientPrivate);
            }
        }
        digestFull = MessageDigest.getInstance(MessageDigest.ALG_SHA_256, false);
        digestAuthorization = MessageDigest.getInstance(MessageDigest.ALG_SHA_256, false);
        digestScratch = MessageDigest.getInstance(MessageDigest.ALG_SHA_256, false);
        blobEncryptDecrypt = Cipher.getInstance(Cipher.ALG_DES_CBC_NOPAD, false);
        signature = Signature.getInstance(Signature.ALG_ECDSA_SHA_256, false);
        try {
            digestRipemd = MessageDigest.getInstance(MessageDigest.ALG_RIPEMD160, false);
        }
        catch(CryptoException e) {
            // A typical Java Card implementation will not support RIPEMD160 - we deal with it
        }
        try {
        	digestSha512 = MessageDigest.getInstance(MessageDigest.ALG_SHA_512, false); 
        }
        catch(CryptoException e) {
        	sha512 = new SHA512();
        }
        try {
        	signatureHmac = Signature.getInstance(Signature.ALG_HMAC_SHA_512, false);
        	try {
                // ok, let's save RAM        		
        		keyHmac = (HMACKey)KeyBuilder.buildKey(KeyBuilder.TYPE_HMAC_TRANSIENT_DESELECT, HMAC_SHA512_SIZE, false);
                keyHmac2 = (HMACKey)KeyBuilder.buildKey(KeyBuilder.TYPE_HMAC_TRANSIENT_DESELECT, HMAC_SHA512_SIZE, false);
        	}
        	catch(CryptoException e) {
        		try {
                    // ok, let's save a bit less RAM        			
        			keyHmac = (HMACKey)KeyBuilder.buildKey(KeyBuilder.TYPE_HMAC_TRANSIENT_RESET, HMAC_SHA512_SIZE, false);
                    keyHmac2 = (HMACKey)KeyBuilder.buildKey(KeyBuilder.TYPE_HMAC_TRANSIENT_RESET, HMAC_SHA512_SIZE, false);
        		}
        		catch(CryptoException e1) {
                    // ok, let's test the flash wear leveling \o/        			
        			keyHmac = (HMACKey)KeyBuilder.buildKey(KeyBuilder.TYPE_HMAC, HMAC_SHA512_SIZE, false);
                    keyHmac2 = (HMACKey)KeyBuilder.buildKey(KeyBuilder.TYPE_HMAC, HMAC_SHA512_SIZE, false);
        		}
        	}        	
        }
        catch(CryptoException e) {
        	signatureHmac = null;
        }
        // Optional initializations if no proprietary API is available
        try {
        	keyAgreement = KeyAgreement.getInstance(KeyAgreement.ALG_EC_SVDP_DH_PLAIN, false);
        }
        catch(CryptoException e) {
        	// Not having the KeyAgreement API is manageable if there is a proprietary API to recover public keys
            // and if the airgapped personalization can be skipped
        	// Otherwise there should be a remote secure oracle performing public derivations and sending back results
        }
        try {
            publicKey = (ECPublicKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PUBLIC, KeyBuilder.LENGTH_EC_FP_256, false);
            Secp256k1.setCommonCurveParameters(publicKey);        	
        }
        catch(CryptoException e) {
        }                
        try {
                keyPair = new KeyPair(
                        (ECPublicKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PUBLIC, KeyBuilder.LENGTH_EC_FP_256, false),
                        (ECPrivateKey)KeyBuilder.buildKey(KeyBuilder.TYPE_EC_FP_PRIVATE, KeyBuilder.LENGTH_EC_FP_256, false));
                Secp256k1.setCommonCurveParameters((ECKey)keyPair.getPrivate());
                Secp256k1.setCommonCurveParameters((ECKey)keyPair.getPublic());
        }
        catch(CryptoException e) {            
        }
        try {
            blobEncryptDecryptAES = Cipher.getInstance(Cipher.ALG_AES_BLOCK_128_CBC_NOPAD, false);
        }
        catch(CryptoException e) {            
        }
    }
    
    public static void initTransientPrivate(byte[] keyBuffer, short keyOffset) {
        if (transientPrivateTransient) {
        	Secp256k1.setCommonCurveParameters(transientPrivate);
        }
        transientPrivate.setS(keyBuffer, keyOffset, (short)32);    	
    }
    
    public static void signTransientPrivate(byte[] keyBuffer, short keyOffset, byte[] dataBuffer, short dataOffset, byte[] targetBuffer, short targetOffset) {
        initTransientPrivate(keyBuffer, keyOffset);
        Util.arrayFillNonAtomic(keyBuffer, keyOffset, (short)32, (byte)0x00);
        // recheck with the target platform, initializing once instead might be possible and save a few flash write
        // (this part is unspecified in the Java Card API)
        signature.init(transientPrivate, Signature.MODE_SIGN);
        signature.sign(dataBuffer, dataOffset, (short)32, targetBuffer, targetOffset);
        if (transientPrivateTransient) {
            transientPrivate.clearKey();
        }

        fixS(targetBuffer, targetOffset);
    }
    
    // following method is only used if no proprietary API is available
    public static boolean verifyPublic(byte[] keyBuffer, short keyOffset, byte[] dataBuffer, short dataOffset, byte[] signatureBuffer, short signatureOffset) {
    	publicKey.setW(keyBuffer, keyOffset, (short)65);
    	signature.init(publicKey, Signature.MODE_VERIFY);
    	try {
    		return signature.verify(dataBuffer, dataOffset, (short)32, signatureBuffer, signatureOffset, (short)(signatureBuffer[(short)(signatureOffset + 1)] + 2));
    	}
    	catch(Exception e) {
    		return false;
    	}
    }
    
    public static void initCipher(DESKey key, boolean encrypt) {
        blobEncryptDecrypt.init(key, (encrypt ? Cipher.MODE_ENCRYPT : Cipher.MODE_DECRYPT), IV_ZERO, (short)0, (short)IV_ZERO.length);
    }

    public static byte getRandomByteModulo(short modulo) {
        short rng_max = (short)(256 % modulo);
        short rng_limit = (short)(256 - rng_max);
        short candidate = (short)0;
        do {
            random.generateData(scratch, (short)0, (short)1);
            candidate = (short)(scratch[0] & 0xff);
        }
        while(candidate > rng_limit);
        return (byte)(candidate % modulo);
    }

    /**
     * Fixes the S value of the signature as described in BIP-62 to avoid malleable signatures. It also fixes the all
     * internal TLV length fields. Returns the number of bytes by which the overall signature length changed (0 or -1).
     *
     * @param sig the signature
     * @param off the offset
     * @return the number of bytes by which the signature length changed
     */
    static short fixS(byte[] sig, short off) {
        short sOff = (short) (sig[(short) (off + 3)] + (short) (off + 5));
        short ret = 0;

        if (sig[sOff] == 33) {
            Util.arrayCopyNonAtomic(sig, (short) (sOff + 2), sig, (short) (sOff + 1), (short) 32);
            sig[sOff] = 32;
            sig[(short)(off + 1)]--;
            ret = -1;
        }

        sOff++;

        if (ret == -1 || ucmp256(sig, sOff, MAX_S, (short) 0) > 0) {
            sub256(S_SUB, (short) 0, sig, sOff, sig, sOff);
        }

        return ret;
    }

    /**
     * Compares two 256-bit numbers. Returns a positive number if a > b, a negative one if a < b and 0 if a = b.
     *
     * @param a the a operand
     * @param aOff the offset of the a operand
     * @param b the b operand
     * @param bOff the offset of the b operand
     * @return the comparison result
     */
    private static short ucmp256(byte[] a, short aOff, byte[] b, short bOff) {
        short ai, bi;
        for (short i = 0 ; i < 32; i++) {
            ai = (short)(a[(short)(aOff + i)] & 0x00ff);
            bi = (short)(b[(short)(bOff + i)] & 0x00ff);

            if (ai != bi) {
                return (short)(ai - bi);
            }
        }

        return 0;
    }

    /**
     * Subtraction of two 256-bit numbers.
     *
     * @param a the a operand
     * @param aOff the offset of the a operand
     * @param b the b operand
     * @param bOff the offset of the b operand
     * @param out the output buffer
     * @param outOff the offset in the output buffer
     * @return the carry of the subtraction
     */
    private static short sub256(byte[] a, short aOff,  byte[] b, short bOff, byte[] out, short outOff) {
        short outI = 0;

        for (short i = 31 ; i >= 0 ; i--) {
            outI = (short)  ((short)(a[(short)(aOff + i)] & 0xFF) - (short)(b[(short)(bOff + i)] & 0xFF) - outI);
            out[(short)(outOff + i)] = (byte)outI ;
            outI = (short)(((outI >> 8) != 0) ? 1 : 0);
        }

        return outI;
    }

    final static private byte[] MAX_S = { (byte) 0x7F, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0x5D, (byte) 0x57, (byte) 0x6E, (byte) 0x73, (byte) 0x57, (byte) 0xA4, (byte) 0x50, (byte) 0x1D, (byte) 0xDF, (byte) 0xE9, (byte) 0x2F, (byte) 0x46, (byte) 0x68, (byte) 0x1B, (byte) 0x20, (byte) 0xA0 };
    final static private byte[] S_SUB = { (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFF, (byte) 0xFE, (byte) 0xBA, (byte) 0xAE, (byte) 0xDC, (byte) 0xE6, (byte) 0xAF, (byte) 0x48, (byte) 0xA0, (byte) 0x3B, (byte) 0xBF, (byte) 0xD2, (byte) 0x5E, (byte) 0x8C, (byte) 0xD0, (byte) 0x36, (byte) 0x41, (byte) 0x41 };


    private static final byte[] IV_ZERO = { 0, 0, 0, 0, 0, 0, 0, 0 };
    private static final byte[] IV_ZERO_AES = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };

    private static byte[] scratch;
    protected static ECPrivateKey transientPrivate;    
    protected static boolean transientPrivateTransient;    
    protected static Signature signature;
    protected static Signature signatureHmac;
    protected static HMACKey keyHmac;
    protected static HMACKey keyHmac2; // duplicated because platforms don't like changing the key size on the fly
    protected static MessageDigest digestFull;
    protected static MessageDigest digestAuthorization;
    protected static MessageDigest digestScratch;
    protected static MessageDigest digestRipemd;
    protected static MessageDigest digestSha512;
    protected static SHA512 sha512;
    protected static RandomData random;
    protected static Cipher blobEncryptDecrypt;    
    protected static Cipher blobEncryptDecryptAES;

    protected static KeyAgreement keyAgreement;
    protected static KeyPair keyPair;
    
    // following variables are only used if no proprietary API is available
    protected static ECPublicKey publicKey; 
    
}
