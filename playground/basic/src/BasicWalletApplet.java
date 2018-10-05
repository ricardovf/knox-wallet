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
import org.spongycastle.pqc.math.linearalgebra.ByteUtils;

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
        entropyKeyLength = MAX_ENTROPY_LENGTH;
        masterDerived = new byte[(short) (MAX_ENTROPY_LENGTH << 1)];
        genuinenessPrivateKey = new byte[32];

        // Chip Key is unique for a device and is used to encrypt memory
        chipKey = (DESKey)KeyBuilder.buildKey(KeyBuilder.TYPE_DES, KeyBuilder.LENGTH_DES3_2KEY, false);

        // Generate the genuineness public and private key
        Crypto.random.nextBytes(genuinenessPrivateKey, (short)0, (short)32);
        // Ensure key is in range: https://en.bitcoin.it/wiki/Private_key#Range_of_valid_ECDSA_private_keys
        if (MathMod256.ucmp(genuinenessPrivateKey, (short)0, Secp256k1.SECP256K1_R, (short)0) >= 0) {
            ISOException.throwIt(ISO7816.SW_DATA_INVALID);
        }

        // Set state as installed
        state = STATE_INSTALLED;

        // Erase memory
        erase();

        // Uncomment to make the real Applet.cap
        proprietaryAPI = new JCardSIMProprietaryAPI();

        register();
    }

    /**
     * Clears the memory and reset state to installed
     */
    protected static void erase() {
        // Set a random chip key for this device
        Crypto.random.nextBytes(scratch256, (short)0, (short)16);
        chipKey.setKey(scratch256, (short)0);
        // Clean scratch memory used for generating the chip key
        Util.arrayFillNonAtomic(scratch256, (short)0, (short)16, (byte)0x00);

        // Setup needs to be run again
        state = STATE_INSTALLED;
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

            // Setup seed (using provided BIP39 seed)
            // Store the seed on the scratch memory, derive the seed and encrypt it
            Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short) 0, (short)64);
            _makeBIP32Seed();

            // Go direct to ready state
            state = STATE_READY;
        } else {
            state = STATE_SETUP_DONE;
        }

        apdu.setOutgoingAndSend((short) 0, (short) 0);
    }

    /**
     * Derives a random seed
     */
    private static void _makeRandomSeed() {
        // Lets generate a random entropy with the maximum size
        Crypto.random.nextBytes(scratch256, (short)0, (short)64);

        _makeBIP32Seed();
    }

    /**
     * Derive the seed from the entropy that is expected to be in the scratch memory (position 0)
     */
    private static void _makeBIP32Seed() {
        // Derive the seed from the scratch memory
        Bip32.deriveSeed();

        // Encrypt the seed using the chipkey
        Crypto.initCipher(chipKey, true);
        Crypto.blobEncryptDecrypt.doFinal(masterDerived, (short) 0, (short) DEFAULT_SEED_LENGTH, masterDerived, (short) 0);

        // Clears scratch with random data
        Crypto.random.nextBytes(scratch256, (short) 0, (short) 64);
    }

    /**
     * Same as _makeBIP32Seed but will store the derived seed on the end of the scratch memory
     */
    private static void _makeBIP32SeedOnEndOfScratch() {
        // Derive the seed from the scratch memory
        Bip32.deriveSeedToEndOfScratchMemory();

        // Encrypt the seed using the chipkey
        Crypto.initCipher(chipKey, true);
        Crypto.blobEncryptDecrypt.doFinal(scratch256, (short)(256-DEFAULT_SEED_LENGTH), (short)DEFAULT_SEED_LENGTH, scratch256, (short)(256-DEFAULT_SEED_LENGTH));
    }

    /**
     * This method generates the seed words (BIP39) and puts in the scratch memory position 100.
     * The data generated is actually a sequence of 24 16-bit big-endian integers with values ranging from 0 to 2047.
     * CS = ENT / 32
     * MS = (ENT + CS) / 11
     *
     * |  ENT  | CS | ENT+CS |  MS  | entropyKeyLength
     * +-------+----+--------+------+----+
     * |  256  |  8 |   264  |  24  | 64
     */
    private static void _generateSeedWordsIndexes() {
        short offsetStart = (short)0;
        short csLen = (short)8;
        short entLen = (short) (csLen * 4); // 32

        // Generate random entropy
        Crypto.random.nextBytes(scratch256, (short)0, entLen);

        // Calculate the checksum (sha256) of the master key
        Crypto.digestScratch.doFinal(scratch256, offsetStart, entLen, scratch256, (short)(offsetStart + entLen));
        entLen += offsetStart + 1;

        // We will use only the first 8 bits of the checksum, so we clear the memory just to be sure
        Util.arrayFillNonAtomic(scratch256, (short)(offsetStart + entLen), (short)64, (byte)0x00);

        short outOff = (short)100;
        short rShift = 0;
        short vp = 0;

        for (short i = offsetStart; i < entLen; i += 2) {
            short w = Util.getShort(scratch256, i);
            Util.setShort(scratch256, outOff, logicrShift((short) (vp | logicrShift(w, rShift)), (short) 5));
            outOff += 2;
            rShift += 5;
            vp = (short) (w << (16 - rShift));

            if (rShift >= 11) {
                Util.setShort(scratch256, outOff, logicrShift(vp, (short) 5));
                outOff += 2;
                rShift = (short) (rShift - 11);
                vp = (short) (w << (16 - rShift));
            }
        }
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
            proprietaryAPI.signDeterministicECDSASHA256(keyBuffer, keyOffset, dataBuffer, dataOffset, targetBuffer, targetOffset);
        }
    }

    private static void handleChangeNetwork(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        short offset = ISO7816.OFFSET_CDATA;
        apdu.setIncomingAndReceive();

        // Reset the BIP32 cache
        Bip32Cache.reset();

        // Setup Bitcoin version
        stdVersion = buffer[offset++];

        // Setup P2SH version
        p2shVersion = buffer[offset++];

        apdu.setOutgoingAndSend((short) 0, (short) 0);
    }

    /**
     * Handle the erase command
     *
     * @param apdu
     * @throws ISOException
     */
    private static void handleErase(APDU apdu) throws ISOException {
        if (currentMode == MODE_DEVELOPMENT) {
            erase();
        } else {
            erase();
            currentMode = MODE_WALLET;
            state = STATE_SETUP_DONE;
        }

        apdu.setOutgoingAndSend((short) 0, (short) 0);
    }

    /**
     * Handles the validate BIP39 seed against the BIP32 seed on the wallet
     * @param apdu
     * @throws ISOException
     */
    private static void handleValidateSeedBackup(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        short offset = ISO7816.OFFSET_CDATA;

        apdu.setIncomingAndReceive();

        // Copy the received BIP39 seed into the scratch memory
        Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short) 0, (short)DEFAULT_SEED_LENGTH);

        // Generate the BIP32 seed that will be encrypted on masterDerived
        _makeBIP32SeedOnEndOfScratch();

        // Compare masterDerived with the original masterDerived on the end of the scratch memory
        if (Util.arrayCompare(masterDerived, (short)0, scratch256, (short)(256-DEFAULT_SEED_LENGTH), (short)DEFAULT_SEED_LENGTH) != (byte)0x00) {
            ISOException.throwIt(ISO7816.SW_WRONG_DATA);
        }

        apdu.setOutgoingAndSend((short) 0, (short)0);
    }

    /**
     * Handles the prepare seed command, generating a new seed or recovering from backup words
     *
     * @param apdu
     * @throws ISOException
     */
    private static void handlePrepareSeed(APDU apdu) throws ISOException {
        // Prepare seed can only be called on normal Wallet mode
        if (currentMode == MODE_DEVELOPMENT) {
            ISOException.throwIt(ISO7816.SW_CONDITIONS_NOT_SATISFIED);
        }

        byte[] buffer = apdu.getBuffer();
        short offset = ISO7816.OFFSET_CDATA;

        if (buffer[ISO7816.OFFSET_P1] == P1_PREPARE_SEED_GENERATE_WORDS) {
            // Put the random seed words on the scratch memory at position 100 (48 bytes length: 24 words, 16 bits each)
            _generateSeedWordsIndexes();
            Util.arrayCopyNonAtomic(scratch256, (short)100, buffer, (short)0, (short) 48);
            apdu.setOutgoingAndSend((short) 0, (short) 48);
        } else if (buffer[ISO7816.OFFSET_P1] == P1_PREPARE_SEED) {
            Bip32Cache.reset();
            apdu.setIncomingAndReceive();
            Util.arrayCopyNonAtomic(buffer, offset, scratch256, (short) 0, (short)64);
            _makeBIP32Seed();

            // Go to ready state
            state = STATE_READY;
            apdu.setOutgoingAndSend((short) 0, (short)0);
        } else {
            ISOException.throwIt(ISO7816.SW_INCORRECT_P1P2);
        }
    }

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
//            if ((proprietaryAPI == null) && ((scratch256[Bip32.OFFSET_DERIVATION_INDEX] & (byte)0x80) == 0)) {
//                if (!Bip32Cache.setPublicIndex(buffer, (short)(ISO7816.OFFSET_CDATA + 1), i)) {
//                    ISOException.throwIt(SW_PUBLIC_POINT_NOT_AVAILABLE);
//                }
//            }
            if (!Bip32.derive(buffer)) {
                ISOException.throwIt(ISO7816.SW_WRONG_DATA);
            }
            Bip32Cache.storePrivate(buffer, (short)(ISO7816.OFFSET_CDATA + 1), (byte)(i + 1), scratch256);
        }
//        if (proprietaryAPI == null) {
//            if (!Bip32Cache.setPublicIndex(buffer, offset, derivationSize)) {
//                ISOException.throwIt(SW_PUBLIC_POINT_NOT_AVAILABLE);
//            }
//        }
        // Finally output
        offset = 0;
        buffer[offset++] = (short)65;
//        if (proprietaryAPI == null) {
//            Bip32Cache.copyLastPublic(buffer, offset);
//        } else {
            proprietaryAPI.getUncompressedPublicPoint(scratch256, (short)0, buffer, offset);
//        }
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
//            if ((proprietaryAPI == null) && ((scratch256[Bip32.OFFSET_DERIVATION_INDEX] & (byte)0x80) == 0)) {
//                if (!Bip32Cache.setPublicIndex(buffer, (short)(ISO7816.OFFSET_CDATA + 1), i)) {
//                    ISOException.throwIt(SW_PUBLIC_POINT_NOT_AVAILABLE);
//                }
//            }
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

            buffer[(short)0] = TC.TRUE;

            // Check the signature is valid
            if ((proprietaryAPI == null) || (!proprietaryAPI.hasDeterministicECDSASHA256())) {
                if (!Crypto.verifyPublic(scratch256, (short)180, buffer, offset, scratch256, (short)100)) {
                    buffer[(short)0] = TC.FALSE;
                }
            } else {
                if (!proprietaryAPI.verifyECDSASHA256(scratch256, (short)180, buffer, offset, scratch256, (short)100)) {
                    buffer[(short)0] = TC.FALSE;
                }
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
//            System.out.println(ByteUtils.toHexString(scratch256));
            apdu.setOutgoingAndSend((short)0, signatureSize);
        } else {
            ISOException.throwIt(ISO7816.SW_INCORRECT_P1P2);
        }
    }

    /**
     * Handles the prove genuineness command. Expects to receive a sha256 hash to be signed.
     * @param apdu
     * @throws ISOException
     */
    private static void handleProveGenuineness(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        short offset = ISO7816.OFFSET_CDATA;

        apdu.setIncomingAndReceive();

        if (buffer[ISO7816.OFFSET_LC] != 0x20) {
            ISOException.throwIt(ISO7816.SW_WRONG_LENGTH);
        }

        // Copy the genuineness private key to the scratch
        Util.arrayCopyNonAtomic(genuinenessPrivateKey, (short)0, scratch256, (short)0, (short)genuinenessPrivateKey.length);

        // Sign the data SHA-256 hash with the genuineness private key
//        System.out.println(ByteUtils.toHexString(buffer));
        _signTransientPrivate(scratch256, (short)0, buffer, offset, scratch256, (short)100);

        // Get the public key
        proprietaryAPI.getUncompressedPublicPoint(genuinenessPrivateKey, (short)0, scratch256, (short)0);

        // Check the signature is valid using the genuineness public key
        if ((proprietaryAPI == null) || (!proprietaryAPI.hasDeterministicECDSASHA256())) {
            if (!Crypto.verifyPublic(scratch256, (short)0, buffer, offset, scratch256, (short)100)) {
                 ISOException.throwIt(ISO7816.SW_UNKNOWN);
            }
        } else {
            if (!proprietaryAPI.verifyECDSASHA256(scratch256, (short)0, buffer, offset, scratch256, (short)100)) {
                 ISOException.throwIt(ISO7816.SW_UNKNOWN);
            }
        }

        short signatureSize = (short)((short)(scratch256[(short)101] & 0xff) + 2);

        Util.arrayCopyNonAtomic(scratch256, (short)100, buffer, (short)0, signatureSize);
        apdu.setOutgoingAndSend((short)0, signatureSize);
    }

    /**
     * Handles the get genuineness public key command. Returns the public key (EC).
     * @param apdu
     * @throws ISOException
     */
    private static void handleGetGenuinenessKey(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();

        // Get the public key
        proprietaryAPI.getUncompressedPublicPoint(genuinenessPrivateKey, (short)0, scratch256, (short)0);


        Util.arrayCopyNonAtomic(scratch256, (short)0, buffer, (short)0, (short)65);
        apdu.setOutgoingAndSend((short)0, (short)65);
    }

    private static void handleVerifyPin(APDU apdu) throws ISOException {
        byte[] buffer = apdu.getBuffer();
        if (buffer[ISO7816.OFFSET_P1] == P1_GET_REMAINING_ATTEMPTS) {
            buffer[0] = walletPin.getTriesRemaining();
            apdu.setOutgoingAndSend((short)0, (short)1);
            return;
        }

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {}

        apdu.setIncomingAndReceive();
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

    public boolean select() {
//        proprietaryAPI.ecc.refreshAfterReset();
        return true;
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
                    case INS_PIN_VERIFIED:
                        checkStateIsNot(STATE_INSTALLED);
                        checkStateIsNot(STATE_SETUP_DONE);
                        checkAccess();
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
    private static final byte WALLET_PIN_SIZE = (byte) 0x0C;

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
    private static final byte INS_PIN_VERIFIED = (byte)0x62;
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
    private static final byte P1_PREPARE_SEED_GENERATE_WORDS = (byte)0x00;
    private static final byte P1_PREPARE_SEED = (byte)0x80;

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

    protected static final byte DEFAULT_SEED_LENGTH = (byte) 64;
    private static final byte MIN_ENTROPY_LENGTH = (byte) 16;
    private static final byte MAX_ENTROPY_LENGTH = (byte) 32;

    private static final byte MAX_DERIVATION_PATH = (byte)10;
    private static final byte AVAILABLE_MODES[] = {MODE_WALLET, MODE_DEVELOPMENT};

    public static final byte GENERATE_MNEMONIC_CS_MIN = 4;
    public static final byte GENERATE_MNEMONIC_CS_MAX = 8;

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
    protected static byte entropyKeyLength;
    protected static byte[] masterDerived;
    protected static byte[] genuinenessPrivateKey;
    protected static ProprietaryAPI proprietaryAPI;

    /**
     * Logically shifts the given short to the right. Used internally by the generateMnemonic method. This method exists
     * because a simple logical right shift using shorts would most likely work on the actual target (which does math on
     * shorts) but not on the simulator since a negative short would first be extended to 32-bit, shifted and then cut
     * back to 16-bit, doing the equivalent of an arithmetic shift. Simply masking by 0x0000FFFF before shifting is not an
     * option because the code would not convert to CAP file (because of int usage). Since this method works on both
     * JavaCard and simulator and it is not invoked very often, the performance hit is non-existent.
     *
     * @param v value to shift
     * @param amount amount
     * @return logically right shifted value
     */
    private static short logicrShift(short v, short amount) {
        if (amount == 0) return v; // short circuit on 0
        short tmp = (short) (v & 0x7fff);

        if (tmp == v) {
            return (short) (v >>> amount);
        }

        tmp = (short) (tmp >>> amount);

        return (short) ((short)((short) 0x4000 >>> (short) (amount - 1)) | tmp);
    }
}
