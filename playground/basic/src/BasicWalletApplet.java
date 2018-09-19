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

/* This file is automatically processed from the .javap version and only included for convenience. Please refer to the .javap file
   for more readable code */

package com.knox.playground.basic;

import javacard.framework.*;
import javacard.security.DESKey;
import javacard.security.KeyBuilder;

public class BasicWalletApplet extends Applet {
    /**
     * Constructor of the wallet Applet
     * @param parameters
     * @param parametersOffset
     * @param parametersLength
     */
    public BasicWalletApplet(byte[] parameters, short parametersOffset, byte parametersLength) {
        TC.init();
        Crypto.init();
        Bip32Cache.init();
        scratch256 = JCSystem.makeTransientByteArray((short) 256, JCSystem.CLEAR_ON_DESELECT);
        walletPin = new OwnerPIN(WALLET_PIN_ATTEMPTS, WALLET_PIN_SIZE);
        masterDerived = new byte[64];
        genuinenessPrivateKey = new byte[32];

        // Chip Key is unique for a device and is used to encrypt memory
        chipKey = (DESKey)KeyBuilder.buildKey(KeyBuilder.TYPE_DES, KeyBuilder.LENGTH_DES3_2KEY, false);

        // Generate the genuineness private key
        Crypto.random.generateData(genuinenessPrivateKey, (short)0, (short)32);

        // Set state as installed
        state = STATE_INSTALLED;

        // Erase memory
        erase();

        // Uncomment to make the real Applet.cap
        proprietaryAPI = new JCardSIMProprietaryAPI();

        register();
    }

    /**
     * Clears the memory and reset state. If not in develop mode and setup already done, will make setup automatically
     */
    protected static void erase() {
        // Set a random chip key for this device
        Crypto.random.generateData(scratch256, (short)0, (short)16);
        chipKey.setKey(scratch256, (short)0);
        // Clean scratch memory used for generating the chip key
        Util.arrayFillNonAtomic(scratch256, (short)0, (short)16, (byte)0x00);

        if (currentMode == MODE_DEVELOPMENT) {
            // The developer will need to run setup again
            state = STATE_INSTALLED;
        } else if (state != STATE_INSTALLED) {
            // We will need to simulate the setup run (it generates a random seed when not on development mode)
            state = STATE_SETUP_DONE;
            _makeRandomSeed();
        }
    }

    /**
     * Installs the Applet in the smart card
     *
     * @param bArray
     * @param bOffset
     * @param bLength
     * @throws ISOException
     */
    public static void install(byte bArray[], short bOffset, byte bLength) throws ISOException {
        new BasicWalletApplet(bArray, bOffset, bLength);
    }

    /**
     * Handle setup command
     *
     * @param apdu
     * @throws ISOException
     */
    private static void handleSetup(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        short offset = ISO7816.OFFSET_CDATA;
        byte keyLength;
        apdu.setIncomingAndReceive();

        if (buffer[ISO7816.OFFSET_P1] != P1_REGULAR_SETUP) {
            ISOException.throwIt(ISO7816.SW_INCORRECT_P1P2);
        }
        Bip32Cache.reset();

        // Setup mode
        supportedModes = buffer[offset++];
        for (byte i = 0; i < (byte) AVAILABLE_MODES.length; i++) {
            if ((supportedModes & AVAILABLE_MODES[i]) != 0) {
                currentMode = AVAILABLE_MODES[i];
                break;
            }
        }

        // Setup Bitcoin version
        stdVersion = buffer[offset++];

        // Setup P2SH version
        p2shVersion = buffer[offset++];

        // In development mode, we go direct to ready state
        if (currentMode == MODE_DEVELOPMENT) {
            // Setup PIN
            walletPinSize = buffer[offset++];
            if ((short)walletPinSize < (short)WALLET_PIN_MIN_SIZE || (short)walletPinSize > (short)WALLET_PIN_SIZE) {
                ISOException.throwIt(ISO7816.SW_DATA_INVALID);
            }
            Util.arrayFillNonAtomic(scratch256, (short) 0, WALLET_PIN_SIZE, (byte) 0xff);
            Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short) 0, walletPinSize);
            walletPin.update(scratch256, (short) 0, WALLET_PIN_SIZE);
            walletPin.resetAndUnblock();
            offset += walletPinSize;

            // Setup SEED
            keyLength = buffer[offset++];
            // We have a seed, lets setup it
            if ((keyLength < 0) || (keyLength > DEFAULT_SEED_LENGTH)) {
                ISOException.throwIt(ISO7816.SW_DATA_INVALID);
            }
            // Store the seed on the scratch memory and encrypt it
            Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short) 0, keyLength);
            _makeSeed(keyLength);

            // Go direct to ready state
            state = STATE_READY;
        } else {
            // If we do not have a SEED yet, lets generate a random one
            _makeRandomSeed();

            // Set the wallet state
            state = STATE_SETUP_DONE;
        }

        apdu.setOutgoingAndSend((short) 0, (short) 0);
    }

    /**
     * Derives a random seed
     */
    private static void _makeRandomSeed() {
        // If we do not have a SEED yet, lets generate a random one
        byte keyLength = DEFAULT_SEED_LENGTH;
        Crypto.random.generateData(scratch256, (short) 0, keyLength);

        _makeSeed(keyLength);
    }

    /**
     * Derive the seed that is expected to be in the scratch memory
     * @param keyLength
     */
    private static void _makeSeed(byte keyLength) {
        // Derive the seed from the scratch memory
        Bip32.deriveSeed(keyLength);

        // Encrypt the seed using the chipkey
        Crypto.initCipher(chipKey, true);
        Crypto.blobEncryptDecrypt.doFinal(masterDerived, (short) 0, (short) DEFAULT_SEED_LENGTH, masterDerived, (short) 0);

        // Clears scratch with random data
        Crypto.random.generateData(scratch256, (short) 0, (short) 16);
    }

    // Compressed public key in scratch256, 0
    private static short _publicKeyToAddress(byte[] out, short outOffset) {
        Crypto.digestScratch.doFinal(scratch256, (short)0, (short)33, scratch256, (short)33);
        if (Crypto.digestRipemd != null) {
            Crypto.digestRipemd.doFinal(scratch256, (short)33, (short)32, scratch256, (short)1);
        }
        else {
            Ripemd160.hash32(scratch256, (short)33, scratch256, (short)1, scratch256, (short)100);
        }
        scratch256[0] = stdVersion;
        Crypto.digestScratch.doFinal(scratch256, (short)0, (short)21, scratch256, (short)21);
        Crypto.digestScratch.doFinal(scratch256, (short)21, (short)32, scratch256, (short)21);
        return Base58.encode(scratch256, (short)0, (short)25, out, outOffset, scratch256, (short)100);
    }

    private static void _signTransientPrivate(byte[] keyBuffer, short keyOffset, byte[] dataBuffer, short dataOffset, byte[] targetBuffer, short targetOffset) {
        if ((proprietaryAPI == null) || (!proprietaryAPI.hasDeterministicECDSASHA256())) {
            Crypto.signTransientPrivate(keyBuffer, keyOffset, dataBuffer, dataOffset, targetBuffer, targetOffset);
        } else {
            Crypto.initTransientPrivate(keyBuffer, keyOffset);
            proprietaryAPI.signDeterministicECDSASHA256(Crypto.transientPrivate, dataBuffer, dataOffset, (short)32, targetBuffer, targetOffset);
            if (Crypto.transientPrivateTransient) {
                Crypto.transientPrivate.clearKey();
            }
        }
    }

    private static void handleChangeNetwork(APDU apdu) throws ISOException {
//        byte[] buffer = apdu.getBuffer();
//        short offset = ISO7816.OFFSET_CDATA;
//        byte keyLength;
//        apdu.setIncomingAndReceive();
//        // If already initialized, throw error
//        if ((setup == TC.TRUE) || (setup != TC.FALSE)) {
//            ISOException.throwIt(ISO7816.SW_CONDITIONS_NOT_SATISFIED);
//        }
//        if (buffer[ISO7816.OFFSET_P1] != P1_REGULAR_SETUP) {
//            ISOException.throwIt(ISO7816.SW_INCORRECT_P1P2);
//        }
//        Bip32Cache.reset();
//        // Setup supported mode
//        supportedModes = buffer[offset++];
//        for (byte i = 0; i < (byte) AVAILABLE_MODES.length; i++) {
//            if ((supportedModes & AVAILABLE_MODES[i]) != 0) {
//                currentMode = AVAILABLE_MODES[i];
//                break;
//            }
//        }
//        // Setup features
//        features = buffer[offset++];
//        if ((features & FEATURE_UNCOMPRESSED_KEYS) != 0) {
//            ISOException.throwIt(ISO7816.SW_DATA_INVALID);
//        }
//
//        // Setup Bitcoin version
//        stdVersion = buffer[offset++];
//
//        // Setup P2SH version
//        p2shVersion = buffer[offset++];
//
//        // Setup wallet PIN
//        walletPinSize = buffer[offset++];
//        if (walletPinSize < 4) {
//            ISOException.throwIt(ISO7816.SW_DATA_INVALID);
//        }
//        Util.arrayFillNonAtomic(scratch256, (short) 0, WALLET_PIN_SIZE, (byte) 0xff);
//        Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short) 0, walletPinSize);
//        walletPin.update(scratch256, (short) 0, WALLET_PIN_SIZE);
//        walletPin.resetAndUnblock();
//        offset += walletPinSize;
//
//        // Setup SEED
//        keyLength = buffer[offset++];
//        if (keyLength == 0) {
//            // If we do not have a SEED yet, lets generate one
//            keyLength = DEFAULT_SEED_LENGTH;
//            Crypto.random.generateData(scratch256, (short) 0, keyLength);
//        } else {
//            // We have a seed, lets setup it
//            if ((keyLength < 0) || (keyLength > DEFAULT_SEED_LENGTH)) {
//                ISOException.throwIt(ISO7816.SW_DATA_INVALID);
//            }
//            // Store the seed on the scratch memory
//            Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short) 0, keyLength);
//        }
//        // Derive the seed from the scratch memory
//        Bip32.deriveSeed(keyLength);
//
//        // Encrypt the seed using the chipkey
//        Crypto.initCipher(chipKey, true);
//        Crypto.blobEncryptDecrypt.doFinal(masterDerived, (short) 0, (short) DEFAULT_SEED_LENGTH, masterDerived, (short) 0);
//
//        Crypto.random.generateData(scratch256, (short) 0, (short) 16);
//        offset = 0;
//        buffer[offset++] = SEED_NOT_TYPED;
//
//        apdu.setOutgoingAndSend((short) 0, offset);
//        setup = TC.TRUE;
    }

    /**
     * Handle the erase command
     *
     * @param apdu
     * @throws ISOException
     */
    private static void handleErase(APDU apdu) throws ISOException {
        erase();
        apdu.setOutgoingAndSend((short) 0, (short) 0);
    }

    private static void handleValidateSeedBackup(APDU apdu) throws ISOException {
        //@todo
    }

    // @todo
    private static void handlePrepareSeed(APDU apdu) throws ISOException {
//        byte[] buffer = apdu.getBuffer();
//        short offset = ISO7816.OFFSET_CDATA;
//        byte keyLength;
//        apdu.setIncomingAndReceive();
//        // If already initialized, throw error
//        if ((setup == TC.TRUE) || (setup != TC.FALSE)) {
//            ISOException.throwIt(ISO7816.SW_CONDITIONS_NOT_SATISFIED);
//        }
//        if (buffer[ISO7816.OFFSET_P1] != P1_REGULAR_SETUP) {
//            ISOException.throwIt(ISO7816.SW_INCORRECT_P1P2);
//        }
//        Bip32Cache.reset();
//        // Setup supported mode
//        supportedModes = buffer[offset++];
//        for (byte i = 0; i < (byte) AVAILABLE_MODES.length; i++) {
//            if ((supportedModes & AVAILABLE_MODES[i]) != 0) {
//                currentMode = AVAILABLE_MODES[i];
//                break;
//            }
//        }
//        // Setup features
//        features = buffer[offset++];
//        if ((features & FEATURE_UNCOMPRESSED_KEYS) != 0) {
//            ISOException.throwIt(ISO7816.SW_DATA_INVALID);
//        }
//
//        // Setup Bitcoin version
//        stdVersion = buffer[offset++];
//
//        // Setup P2SH version
//        p2shVersion = buffer[offset++];
//
//        // Setup wallet PIN
//        walletPinSize = buffer[offset++];
//        if (walletPinSize < 4) {
//            ISOException.throwIt(ISO7816.SW_DATA_INVALID);
//        }
//        Util.arrayFillNonAtomic(scratch256, (short) 0, WALLET_PIN_SIZE, (byte) 0xff);
//        Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short) 0, walletPinSize);
//        walletPin.update(scratch256, (short) 0, WALLET_PIN_SIZE);
//        walletPin.resetAndUnblock();
//        offset += walletPinSize;
//
//        // Setup SEED
//        keyLength = buffer[offset++];
//        if (keyLength == 0) {
//            // If we do not have a SEED yet, lets generate one
//            keyLength = DEFAULT_SEED_LENGTH;
//            Crypto.random.generateData(scratch256, (short) 0, keyLength);
//        } else {
//            // We have a seed, lets setup it
//            if ((keyLength < 0) || (keyLength > DEFAULT_SEED_LENGTH)) {
//                ISOException.throwIt(ISO7816.SW_DATA_INVALID);
//            }
//            // Store the seed on the scratch memory
//            Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short) 0, keyLength);
//        }
//        // Derive the seed from the scratch memory
//        Bip32.deriveSeed(keyLength);
//
//        // Encrypt the seed using the chipkey
//        Crypto.initCipher(chipKey, true);
//        Crypto.blobEncryptDecrypt.doFinal(masterDerived, (short) 0, (short) DEFAULT_SEED_LENGTH, masterDerived, (short) 0);
//
//        Crypto.random.generateData(scratch256, (short) 0, (short) 16);
//        offset = 0;
//        buffer[offset++] = SEED_NOT_TYPED;
//
//        apdu.setOutgoingAndSend((short) 0, offset);
//        setup = TC.TRUE;
    }


//    private static void handleGetFeatures(APDU apdu) throws ISOException {
//        byte[] buffer = apdu.getBuffer();
//        buffer[0] = (byte)0;
//        if (proprietaryAPI != null) {
//            buffer[0] |= JC_FEATURE_HAS_PROPRIETARY_API;
//        }
//        apdu.setOutgoingAndSend((short)0, (short)1);
//    }
//
    private static void handleGetWalletPublicKey(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        short offset = ISO7816.OFFSET_CDATA;
        byte derivationSize = buffer[offset++];
        byte i;
        if (derivationSize > MAX_DERIVATION_PATH) {
            ISOException.throwIt(ISO7816.SW_DATA_INVALID);
        }
        // Unwrap the initial seed
        Crypto.initCipher(chipKey, false);
        Crypto.blobEncryptDecrypt.doFinal(masterDerived, (short)0, (short)DEFAULT_SEED_LENGTH, scratch256, (short)0);
        // Derive all components
        i = Bip32Cache.copyPrivateBest(buffer, (short)(ISO7816.OFFSET_CDATA + 1), derivationSize, scratch256, (short)0);
        for (; i<derivationSize; i++) {
            Util.arrayCopyNonAtomic(buffer, (short)(offset + 4 * i), scratch256, Bip32.OFFSET_DERIVATION_INDEX, (short)4);
            if ((proprietaryAPI == null) && ((scratch256[Bip32.OFFSET_DERIVATION_INDEX] & (byte)0x80) == 0)) {
                if (!Bip32Cache.setPublicIndex(buffer, (short)(ISO7816.OFFSET_CDATA + 1), i)) {
                    ISOException.throwIt(SW_PUBLIC_POINT_NOT_AVAILABLE);
                }
            }
            if (!Bip32.derive(buffer)) {
                ISOException.throwIt(ISO7816.SW_WRONG_DATA);
            }
            Bip32Cache.storePrivate(buffer, (short)(ISO7816.OFFSET_CDATA + 1), (byte)(i + 1), scratch256);
        }
        if (proprietaryAPI == null) {
            if (!Bip32Cache.setPublicIndex(buffer, offset, derivationSize)) {
                ISOException.throwIt(SW_PUBLIC_POINT_NOT_AVAILABLE);
            }
        }
        // Finally output
        offset = 0;
        buffer[offset++] = (short)65;
        if (proprietaryAPI == null) {
            Bip32Cache.copyLastPublic(buffer, offset);
        } else {
            proprietaryAPI.getUncompressedPublicPoint(scratch256, (short)0, buffer, offset);
        }
        // Save the chaincode
        Util.arrayCopyNonAtomic(scratch256, (short)32, buffer, (short)200, (short)32);
        // Get the encoded address
        Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short)0, (short)65);
        AddressUtils.compressPublicKey(scratch256, (short)0);
        offset += (short)65;
        buffer[offset] = (byte)(_publicKeyToAddress(buffer, (short)(offset + 1)) - (short)(offset + 1));
        offset += (short)(buffer[offset] + 1);
        // Add the chaincode
        Util.arrayCopyNonAtomic(buffer, (short)200, buffer, offset, (short)32);
        offset += 32;
        apdu.setOutgoingAndSend((short)0, offset);
    }

    private static void handleHashSignDerive(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        short offset = ISO7816.OFFSET_CDATA;
        byte i;
        apdu.setIncomingAndReceive();
        byte derivationSize = buffer[offset++];
        if (derivationSize > MAX_DERIVATION_PATH) {
            ISOException.throwIt(ISO7816.SW_DATA_INVALID);
        }
        // Unwrap the initial seed
        Crypto.initCipher(chipKey, false);
        Crypto.blobEncryptDecrypt.doFinal(masterDerived, (short)0, (short)DEFAULT_SEED_LENGTH, scratch256, (short)0);
        // Derive all components
        i = Bip32Cache.copyPrivateBest(buffer, (short)(ISO7816.OFFSET_CDATA + 1), derivationSize, scratch256, (short)0);
        offset += (short)(i * 4);
        for (; i<derivationSize; i++) {
            Util.arrayCopyNonAtomic(buffer, offset, scratch256, Bip32.OFFSET_DERIVATION_INDEX, (short)4);
            if ((proprietaryAPI == null) && ((scratch256[Bip32.OFFSET_DERIVATION_INDEX] & (byte)0x80) == 0)) {
                if (!Bip32Cache.setPublicIndex(buffer, (short)(ISO7816.OFFSET_CDATA + 1), i)) {
                    ISOException.throwIt(SW_PUBLIC_POINT_NOT_AVAILABLE);
                }
            }
            if (!Bip32.derive(buffer)) {
                ISOException.throwIt(ISO7816.SW_WRONG_DATA);
            }
            Bip32Cache.storePrivate(buffer, (short)(ISO7816.OFFSET_CDATA + 1), (byte)(i + 1), scratch256);
            offset += (short)4;
        }
    }

    private static void handleSignTransaction(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        short offset = ISO7816.OFFSET_CDATA;
        // Is preparing the message to be signed
        if (buffer[ISO7816.OFFSET_P1] == P1_PREPARE_TRANSACTION) {
            // Check derivation address
            byte derivationSize = buffer[offset++];
            offset += (short)(4 * derivationSize);

            // Copy the public key to verify the signature
            proprietaryAPI.getUncompressedPublicPoint(scratch256, (short)0, scratch256, (short) 180);

            // Sign the data SHA-256 hash
            _signTransientPrivate(scratch256, (short)0, buffer, offset, scratch256, (short)100);
//            short signatureSize = (short)((short)(buffer[1] & 0xff) + 2);

            buffer[(short)0] = TC.TRUE;

            // Check the signature is valid
            if (!Crypto.verifyPublic(scratch256, (short)180, buffer, offset, scratch256, (short)100)) {
                buffer[(short)0] = TC.FALSE;
            }

            // Clear the private key
            Util.arrayFillNonAtomic(scratch256, (short)0, (short)64, (byte)0x00);
            if (buffer[(short)0] != TC.TRUE) {
                TC.ctx[TC.TX_B_MESSAGE_SIGN_READY] = TC.FALSE;
                ISOException.throwIt(ISO7816.SW_DATA_INVALID);
            }
            TC.ctx[TC.TX_B_MESSAGE_SIGN_READY] = TC.TRUE;
            apdu.setOutgoingAndSend((short)0, (short)0);
        } else if (buffer[ISO7816.OFFSET_P1] == P1_SIGN_TRANSACTION) {
            if (TC.ctx[TC.TX_B_MESSAGE_SIGN_READY] != TC.TRUE) {
                ISOException.throwIt(ISO7816.SW_CONDITIONS_NOT_SATISFIED);
            }
            TC.ctx[TC.TX_B_MESSAGE_SIGN_READY] = TC.FALSE;
            short signatureSize = (short)((short)(scratch256[(short)101] & 0xff) + 2);

            Util.arrayCopyNonAtomic(scratch256, (short)100, buffer, (short)0, signatureSize);
            apdu.setOutgoingAndSend((short)0, signatureSize);
        } else {
            ISOException.throwIt(ISO7816.SW_INCORRECT_P1P2);
        }
    }

    private static void handleProveGenuineness(APDU apdu) throws ISOException {

    }
    private static void handleGetGenuinenessKey(APDU apdu) throws ISOException {
        // @todo
//        byte[] buffer = apdu.getBuffer();
//        short offset = ISO7816.OFFSET_CDATA;
//        byte derivationSize = buffer[offset++];
//        byte i;
//        if (derivationSize > MAX_DERIVATION_PATH) {
//            ISOException.throwIt(ISO7816.SW_DATA_INVALID);
//        }
//        // Unwrap the initial seed
//        Crypto.initCipher(chipKey, false);
//        Crypto.blobEncryptDecrypt.doFinal(masterDerived, (short)0, (short)DEFAULT_SEED_LENGTH, scratch256, (short)0);
//        // Derive all components
//        i = Bip32Cache.copyPrivateBest(buffer, (short)(ISO7816.OFFSET_CDATA + 1), derivationSize, scratch256, (short)0);
//        for (; i<derivationSize; i++) {
//            Util.arrayCopyNonAtomic(buffer, (short)(offset + 4 * i), scratch256, Bip32.OFFSET_DERIVATION_INDEX, (short)4);
//            if ((proprietaryAPI == null) && ((scratch256[Bip32.OFFSET_DERIVATION_INDEX] & (byte)0x80) == 0)) {
//                if (!Bip32Cache.setPublicIndex(buffer, (short)(ISO7816.OFFSET_CDATA + 1), i)) {
//                    ISOException.throwIt(SW_PUBLIC_POINT_NOT_AVAILABLE);
//                }
//            }
//            if (!Bip32.derive(buffer)) {
//                ISOException.throwIt(ISO7816.SW_WRONG_DATA);
//            }
//            Bip32Cache.storePrivate(buffer, (short)(ISO7816.OFFSET_CDATA + 1), (byte)(i + 1), scratch256);
//        }
//        if (proprietaryAPI == null) {
//            if (!Bip32Cache.setPublicIndex(buffer, offset, derivationSize)) {
//                ISOException.throwIt(SW_PUBLIC_POINT_NOT_AVAILABLE);
//            }
//        }
//        // Finally output
//        offset = 0;
//        buffer[offset++] = (short)65;
//        if (proprietaryAPI == null) {
//            Bip32Cache.copyLastPublic(buffer, offset);
//        } else {
//            proprietaryAPI.getUncompressedPublicPoint(scratch256, (short)0, buffer, offset);
//        }
//        // Save the chaincode
//        Util.arrayCopyNonAtomic(scratch256, (short)32, buffer, (short)200, (short)32);
//        // Get the encoded address
//        Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short)0, (short)65);
//        AddressUtils.compressPublicKey(scratch256, (short)0);
//        offset += (short)65;
//        buffer[offset] = (byte)(_publicKeyToAddress(buffer, (short)(offset + 1)) - (short)(offset + 1));
//        offset += (short)(buffer[offset] + 1);
//        // Add the chaincode
//        Util.arrayCopyNonAtomic(buffer, (short)200, buffer, offset, (short)32);
//        offset += 32;
//        apdu.setOutgoingAndSend((short)0, offset);
    }

    private static void handleVerifyPin(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        if (buffer[ISO7816.OFFSET_P1] == P1_GET_REMAINING_ATTEMPTS) {
            buffer[0] = walletPin.getTriesRemaining();
            apdu.setOutgoingAndSend((short)0, (short)1);
            return;
        }
        apdu.setIncomingAndReceive();
        if (buffer[ISO7816.OFFSET_LC] != walletPinSize) {
            ISOException.throwIt(ISO7816.SW_WRONG_LENGTH);
        }
        Util.arrayFillNonAtomic(scratch256, (short)0, WALLET_PIN_SIZE, (byte)0xff);
        Util.arrayCopyNonAtomic(buffer, ISO7816.OFFSET_CDATA, scratch256, (short)0, walletPinSize);
        if (!walletPin.check(scratch256, (short)0, WALLET_PIN_SIZE)) {
            if (walletPin.getTriesRemaining() == 0) {
                erase();
            }
            ISOException.throwIt(ISO7816.SW_SECURITY_STATUS_NOT_SATISFIED);
        }
    }

    /**
     * Changes the PIN, if already set, or sets
     * @param apdu
     * @throws ISOException
     */
    private static void handleChangePin(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        short offset = ISO7816.OFFSET_LC;
        apdu.setIncomingAndReceive();

        walletPinSize = buffer[offset++];
        if ((short) walletPinSize < (short) WALLET_PIN_MIN_SIZE || (short) walletPinSize > (short) WALLET_PIN_SIZE) {
            ISOException.throwIt(ISO7816.SW_DATA_INVALID);
        }
        Util.arrayFillNonAtomic(scratch256, (short) 0, WALLET_PIN_SIZE, (byte) 0xff);
        Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short) 0, walletPinSize);

        // Double check pin verification if wallet is not waiting for a PIN
        if (state != STATE_SETUP_DONE && !walletPin.isValidated()) {
            ISOException.throwIt(ISO7816.SW_SECURITY_STATUS_NOT_SATISFIED);
        }

        walletPin.update(scratch256, (short) 0, WALLET_PIN_SIZE);
        walletPin.resetAndUnblock();

        // Update the wallet state
        if (state == STATE_SETUP_DONE)
            state = STATE_PIN_SET;

        apdu.setOutgoingAndSend((short)0, (short)0);
    }

    private static void handleGetFirmwareVersion(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        Util.arrayCopyNonAtomic(FIRMWARE_VERSION, (short)0, buffer, (short)0, (short)FIRMWARE_VERSION.length);
        apdu.setOutgoingAndSend((short)0, (short)FIRMWARE_VERSION.length);
    }

    private static void handleGetState(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        buffer[0] = state;
        apdu.setOutgoingAndSend((short)0, (short)1);
    }

    private static void handleGetMode(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        buffer[0] = currentMode;
        apdu.setOutgoingAndSend((short)0, (short)1);
    }

    public static void clearScratch() {
        if (TC.ctx[TC.TX_B_MESSAGE_SIGN_READY] != TC.TRUE) {
            Util.arrayFillNonAtomic(scratch256, (short)0, (short)scratch256.length, (byte)0x00);
        }
    }

    /**
     * All access conditions are checked before the method call
     * @param apdu
     * @throws ISOException
     */
    public void process(APDU apdu) throws ISOException {
        if (selectingApplet()) {
            return;
        }
        byte[] buffer = apdu.getBuffer();

        if (buffer[ISO7816.OFFSET_CLA] == CLA_BTC) {
            clearScratch();
//            if (isContactless()) {
//                apdu.waitExtension();
//            }
            try {
                switch (buffer[ISO7816.OFFSET_INS]) {
                    case INS_GET_STATE:
                        handleGetState(apdu);
                        break;
                    case INS_GET_GENUINENESS_KEY:
                        handleGetGenuinenessKey(apdu);
                        break;
                    case INS_PROVE_GENUINENESS:
                        handleProveGenuineness(apdu);
                        break;
                    case INS_SETUP:
                        checkStateIs(STATE_INSTALLED);
                        handleSetup(apdu);
                        break;
                    case INS_GET_MODE:
                        checkStateIsNot(STATE_INSTALLED);
                        handleGetMode(apdu);
                        break;
                    case INS_VERIFY_PIN:
                        checkStateIsNot(STATE_INSTALLED);
                        checkStateIsNot(STATE_SETUP_DONE);
                        handleVerifyPin(apdu);
                        break;
                    case INS_CHANGE_PIN:
                        checkStateIsNot(STATE_INSTALLED);
                        if (state != STATE_SETUP_DONE) {
                            checkAccess();
                        }
                        handleChangePin(apdu);
                        break;
                    case INS_CHANGE_NETWORK:
                        checkStateIsNot(STATE_INSTALLED);
                        if (state != STATE_SETUP_DONE) {
                            checkAccess();
                        }
                        handleChangeNetwork(apdu);
                        break;
                    case INS_PREPARE_SEED:
                        checkStateIs(STATE_PIN_SET);
                        checkAccess();
                        handlePrepareSeed(apdu);
                        break;
                    case INS_VALIDATE_SEED_BACKUP:
                        checkStateIs(STATE_READY);
                        checkAccess();
                        handleValidateSeedBackup(apdu);
                        break;
                    case INS_ERASE:
                        checkStateIs(STATE_READY);
                        checkAccess();
                        handleErase(apdu);
                        break;
                    case INS_GET_WALLET_PUBLIC_KEY:
                        checkStateIs(STATE_READY);
                        checkAccess();
                        handleGetWalletPublicKey(apdu);
                        break;
                    case INS_SIGN_TRANSACTION:
                        checkStateIs(STATE_READY);
                        checkAccess();
                        // Split to avoid a stack overflow on JCOP
                        if (buffer[ISO7816.OFFSET_P1] == P1_PREPARE_TRANSACTION) {
                            handleHashSignDerive(apdu);
                        }
                        handleSignTransaction(apdu);
                        break;
                    case INS_GET_FIRMWARE_VERSION:
                        handleGetFirmwareVersion(apdu);
                        break;
                    default:
                        ISOException.throwIt(ISO7816.SW_INS_NOT_SUPPORTED);
                }
            } catch(Exception e) {
//                if (proprietaryAPI.isSimulator()) {
//                    System.out.println("Erro na execução de comando no cartão: ");
//                    System.out.println(e);
//                }
                // Abort the current transaction if an exception is thrown
                TC.clear();
                if (e instanceof CardRuntimeException) {
                    throw ((CardRuntimeException)e);
                } else {
                    ISOException.throwIt(ISO7816.SW_UNKNOWN);
                }
            } finally {
                clearScratch();
            }
            return;
        } else {
            ISOException.throwIt(ISO7816.SW_CLA_NOT_SUPPORTED);
        }

    }

    protected static boolean isContactless() {
        return ((APDU.getProtocol() & APDU.PROTOCOL_MEDIA_MASK) == APDU.PROTOCOL_MEDIA_CONTACTLESS_TYPE_A);
    }

    private static void checkAccess() {
        if (state != STATE_PIN_SET && state != STATE_READY) {
            ISOException.throwIt(ISO7816.SW_CONDITIONS_NOT_SATISFIED);
        }
        if (!walletPin.isValidated()) {
            ISOException.throwIt(ISO7816.SW_SECURITY_STATUS_NOT_SATISFIED);
        }
    }

    /**
     * Throws if state is not as required
     * @param requiredState
     */
    private static void checkStateIs(byte requiredState) {
        if (state != requiredState) {
            ISOException.throwIt(ISO7816.SW_CONDITIONS_NOT_SATISFIED);
        }
    }

    /**
     * Throws if state is equal the unRequired state
     * @param unRequiredState
     */
    private static void checkStateIsNot(byte unRequiredState) {
        if (state == unRequiredState) {
            ISOException.throwIt(ISO7816.SW_CONDITIONS_NOT_SATISFIED);
        }
    }

    private static final byte FIRMWARE_VERSION[] = {
        (byte)0x00, (byte)0x05, (byte)0x00
    };

    protected static final short SW_PUBLIC_POINT_NOT_AVAILABLE = (short)0x6FF6;
    private static final byte WALLET_PIN_ATTEMPTS = (byte) 5;
    private static final byte WALLET_PIN_MIN_SIZE = (byte) 4;
    private static final byte WALLET_PIN_SIZE = (byte) 32;

    private static final byte AUTHORIZATION_NONE = (byte)0x00;
//
    private static final byte TRANSACTION_OUTPUT_SCRIPT_PRE[] = { (byte)0x19, (byte)0x76, (byte)0xA9, (byte)0x14 }; // script length, OP_DUP, OP_HASH160, address length
    private static final byte TRANSACTION_OUTPUT_SCRIPT_POST[] = { (byte)0x88, (byte)0xAC }; // OP_EQUALVERIFY, OP_CHECKSIG
    private static final byte TRANSACTION_OUTPUT_SCRIPT_P2SH_PRE[] = { (byte)0x17, (byte)0xA9, (byte)0x14 }; // script length, OP_HASH160, address length
    private static final byte TRANSACTION_OUTPUT_SCRIPT_P2SH_POST[] = { (byte)0x87 }; // OP_EQUAL
    private static final byte OP_RETURN = (byte)0x6A;
    private static final byte KEY_VERSION_P2SH = (byte)0x05;
    private static final byte KEY_VERSION_P2SH_TESTNET = (byte)0xC4;
    private static final byte KEY_VERSION_PRIVATE = (byte)0x80;
    private static final byte KEY_VERSION = (byte)0x00;
    private static final byte KEY_VERSION_TESTNET = (byte)0x6F;
//
    private static final byte PUBLIC_KEY_W_LENGTH = 65;
    private static final byte PRIVATE_KEY_S_LENGTH = 32;
//
    private static final byte CLA_BTC = (byte) 0xE0;
    private static final byte INS_SETUP = (byte) 0x20;
    private static final byte INS_VERIFY_PIN = (byte)0x22;
    private static final byte INS_CHANGE_PIN = (byte)0x4B;
    private static final byte INS_PREPARE_SEED = (byte)0x4C;
    private static final byte INS_GET_GENUINENESS_KEY = (byte)0x4D;
    private static final byte INS_PROVE_GENUINENESS = (byte)0x4F;
    private static final byte INS_CHANGE_NETWORK = (byte)0x50;
    private static final byte INS_VALIDATE_SEED_BACKUP = (byte)0x52;
    private static final byte INS_SIGN_TRANSACTION = (byte)0x54;
    private static final byte INS_GET_STATE = (byte)0x56;
    private static final byte INS_ERASE = (byte)0x58;
    private static final byte INS_GET_WALLET_PUBLIC_KEY = (byte)0x40;
    private static final byte INS_GET_FIRMWARE_VERSION = (byte)0xC4;
    private static final byte INS_GET_MODE = (byte)0x60;


    private static final byte P1_REGULAR_SETUP = (byte) 0x00;
    private static final byte P1_PREPARE_TRANSACTION = (byte)0x00;
    private static final byte P1_SIGN_TRANSACTION = (byte)0x80;
    private static final byte P1_GET_REMAINING_ATTEMPTS = (byte)0x80;
//
//    private static final byte P1_GET_OPERATION_MODE = (byte)0x00;
//    private static final byte P1_GET_OPERATION_MODE_2FA = (byte)0x01;
//
//    private static final byte P1_INITIATE_PAIRING = (byte)0x01;
//    private static final byte P1_CONFIRM_PAIRING = (byte)0x02;
//
//    private static final byte P1_SET_KEYCARD = (byte)0x01;
//    private static final byte P1_CONFIRM_KEYCARD = (byte)0x02;
//    private static final byte CONFIRM_PREVIOUS_KEYCARD = (byte)0x02;

    public static final byte BLOB_MAGIC_TRUSTED_INPUT = (byte)0x32;
//
    private static final byte LIMIT_GLOBAL_AMOUNT = (byte)0;
    private static final byte LIMIT_MAX_FEES = (byte)(LIMIT_GLOBAL_AMOUNT + TC.SIZEOF_AMOUNT);
    private static final byte LIMIT_MAX_CHANGE = (byte)(LIMIT_MAX_FEES + TC.SIZEOF_AMOUNT);
    private static final byte LIMIT_LAST = (byte)(LIMIT_MAX_CHANGE + TC.SIZEOF_AMOUNT);

    protected static final byte MODE_WALLET = (byte) 0x01;
    protected static final byte MODE_DEVELOPMENT = (byte) 0x08;

    protected static final byte STATE_INSTALLED = (byte)0x00;
    protected static final byte STATE_SETUP_DONE = (byte)0x11;
    protected static final byte STATE_PIN_SET = (byte)0x22;
    protected static final byte STATE_READY = (byte)0x33;

    private static final byte DEFAULT_SEED_LENGTH = (byte) 64;
    private static final byte MAX_DERIVATION_PATH = (byte)10;
    private static final byte AVAILABLE_MODES[] = {MODE_WALLET, MODE_DEVELOPMENT};

    public static byte state;
    public static byte[] scratch256;
    private static OwnerPIN walletPin;
    private static byte walletPinSize;
    protected static DESKey chipKey;
    private static byte supportedModes;
    protected static byte features;
    protected static byte currentMode;
    private static byte stdVersion;
    private static byte p2shVersion;
    protected static byte[] masterDerived;
    protected static byte[] genuinenessPrivateKey;
    protected static ProprietaryAPI proprietaryAPI;
}
