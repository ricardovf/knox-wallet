package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import javacard.framework.Util;
import org.bitcoinj.crypto.MnemonicCode;
import org.bitcoinj.crypto.MnemonicException;
import org.bitcoinj.wallet.DeterministicSeed;
import org.bitcoinj.wallet.UnreadableWalletException;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.spongycastle.pqc.math.linearalgebra.ByteUtils;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.List;

import static javacard.framework.ISO7816.SW_CONDITIONS_NOT_SATISFIED;
import static javacard.framework.ISO7816.SW_SECURITY_STATUS_NOT_SATISFIED;
import static junit.framework.TestCase.fail;
import static org.junit.Assert.assertEquals;

public class SetupWalletTests extends AbstractJavaCardTest {
    @Test
    public void developmentModeTest() throws BTChipException {
        BTChipDongle dongle = getDongle(true);
        dongle.setup(
                new BTChipDongle.OperationMode[]{BTChipDongle.OperationMode.DEVELOPER},
                TESTNET_VERSION,
                TESTNET_P2SH_VERSION,
                DEFAULT_PIN,
                DEFAULT_SEED);

        // Should be on development mode and ready state
        assertEquals(BasicWalletApplet.MODE_DEVELOPMENT, dongle.getCurrentMode());
        assertEquals(BasicWalletApplet.STATE_READY, dongle.getState());

        // Cant call setup again
        try {
            dongle.setup(
                new BTChipDongle.OperationMode[]{BTChipDongle.OperationMode.WALLET},
                TESTNET_VERSION, TESTNET_P2SH_VERSION);
            fail();
        } catch (BTChipException e) {}
    }

    @Test(expected = BTChipException.class)
    public void developmentModeTestWithOutPIN() throws BTChipException {
        BTChipDongle dongle = getDongle(true);
        dongle.setup(
                new BTChipDongle.OperationMode[]{BTChipDongle.OperationMode.DEVELOPER},
                TESTNET_VERSION,
                TESTNET_P2SH_VERSION,
                null,
                DEFAULT_SEED);
    }

    @Test(expected = BTChipException.class)
    public void developmentModeTestWithOutSeed() throws BTChipException {
        BTChipDongle dongle = getDongle(true);
        dongle.setup(
                new BTChipDongle.OperationMode[]{BTChipDongle.OperationMode.DEVELOPER},
                TESTNET_VERSION,
                TESTNET_P2SH_VERSION,
                DEFAULT_PIN,
                null);
    }

    @Test
    public void walletModeTest() throws BTChipException {
        BTChipDongle dongle = getDongle(true);
        dongle.setup(
                new BTChipDongle.OperationMode[]{BTChipDongle.OperationMode.WALLET},
                TESTNET_VERSION,
                TESTNET_P2SH_VERSION);

        // Should be on wallet mode and waiting for PIN setting
        assertEquals(BasicWalletApplet.MODE_WALLET, dongle.getCurrentMode());
        assertEquals(BasicWalletApplet.STATE_SETUP_DONE, dongle.getState());
    }

    @Test
    public void firmwareVersionTest() throws BTChipException {
        BTChipDongle dongle = prepareDongleRestoreTestnet(true);

        BTChipDongle.BTChipFirmware version = dongle.getFirmwareVersion();

        // Should be updated when firmware change
        assertEquals(version.toString(), "0.5.0");
    }

    @Test
    public void cantPrepareSeedIfDevelopmentTest() throws BTChipException {
        BTChipDongle dongle = getDongle(true);
        dongle.setup(
                new BTChipDongle.OperationMode[]{BTChipDongle.OperationMode.DEVELOPER},
                TESTNET_VERSION,
                TESTNET_P2SH_VERSION,
                DEFAULT_PIN,
                DEFAULT_SEED);

        // Should be on development mode and ready state
        assertEquals(BasicWalletApplet.MODE_DEVELOPMENT, dongle.getCurrentMode());
        assertEquals(BasicWalletApplet.STATE_READY, dongle.getState());

        // Can't prepare seed cause its already set on setup
        try {
            dongle.prepareSeed(DEFAULT_SEED);
            fail();
        } catch (BTChipException e) {}

        // Can't get random seed words cause its already set on setup
        try {
            dongle.randomSeedWords();
            fail();
        } catch (BTChipException e) {}
    }

    @Test
    public void canPrepareSeedIfWalletTest() throws BTChipException, UnreadableWalletException, MnemonicException.MnemonicLengthException {
        BTChipDongle dongle = getDongle(true);
        dongle.setup(
                new BTChipDongle.OperationMode[]{BTChipDongle.OperationMode.WALLET},
                TESTNET_VERSION,
                TESTNET_P2SH_VERSION);

        // Should be on wallet mode and waiting for PIN state
        assertEquals(BasicWalletApplet.MODE_WALLET, dongle.getCurrentMode());
        assertEquals(BasicWalletApplet.STATE_SETUP_DONE, dongle.getState());

        // Can't prepare seed cause there is not PIN set
        try {
            dongle.prepareSeed(DEFAULT_SEED);
            fail();
        } catch (BTChipException e) {}

        dongle.changePin(DEFAULT_PIN);

        // Can't prepare seed cause there is not valid PIN entered
        try {
            dongle.prepareSeed(DEFAULT_SEED);
            fail();
        } catch (BTChipException e) {}

        dongle.verifyPin(DEFAULT_PIN);

        // Get a random new seed words
        byte[] seedWordsIndex = dongle.randomSeedWords();
        List<String> words = new ArrayList<String>();
        assertEquals(34, seedWordsIndex.length);

        for (int i = 0; i < seedWordsIndex.length; i += 2) {
            ByteBuffer bb = ByteBuffer.allocate(2);
            bb.order(ByteOrder.BIG_ENDIAN);
            bb.put(seedWordsIndex[i]);
            bb.put(seedWordsIndex[i+1]);
            short shortVal = bb.getShort(0);
            String word = MnemonicCode.INSTANCE.getWordList().get(shortVal);
            words.add(word);
        }

        DeterministicSeed seed = new DeterministicSeed(words, null, "", 1409478661L);

        System.out.println(ByteUtils.toHexString(seed.getSeedBytes()));

        // Set the new seed
        dongle.prepareSeed(seed.getSeedBytes());

        // Should be on wallet mode and ready state
        assertEquals(BasicWalletApplet.MODE_WALLET, dongle.getCurrentMode());
        assertEquals(BasicWalletApplet.STATE_READY, dongle.getState());

        // Can't get random seed  words cause seed is already set
        try {
            dongle.randomSeedWords();
            fail();
        } catch (BTChipException e) {}

        // Can't set seed cause it's already set
        try {
            dongle.prepareSeed(seed.getSeedBytes());
            fail();
        } catch (BTChipException e) {}

        //
    }

    @Test
    public void canRecoverSeedIfWalletTest() throws BTChipException {
        BTChipDongle dongle = getDongle(true);
        dongle.setup(
                new BTChipDongle.OperationMode[]{BTChipDongle.OperationMode.WALLET},
                TESTNET_VERSION,
                TESTNET_P2SH_VERSION);

        // Should be on wallet mode and waiting for PIN state
        assertEquals(BasicWalletApplet.MODE_WALLET, dongle.getCurrentMode());
        assertEquals(BasicWalletApplet.STATE_SETUP_DONE, dongle.getState());

        // Can't prepare seed cause there is not PIN set
        try {
            dongle.prepareSeed(DEFAULT_SEED);
            fail();
        } catch (BTChipException e) {}

        dongle.changePin(DEFAULT_PIN);

        // Can't prepare seed cause there is not valid PIN entered
        try {
            dongle.prepareSeed(DEFAULT_SEED);
            fail();
        } catch (BTChipException e) {}

        dongle.verifyPin(DEFAULT_PIN);

        // Recover a seed
        dongle.prepareSeed(DEFAULT_SEED);

        // Should be on wallet mode and ready state
        assertEquals(BasicWalletApplet.MODE_WALLET, dongle.getCurrentMode());
        assertEquals(BasicWalletApplet.STATE_READY, dongle.getState());

        // Can't prepare seed cause its already set
        try {
            dongle.prepareSeed(DEFAULT_SEED);
            fail();
        } catch (BTChipException e) {}
    }
}