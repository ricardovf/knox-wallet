package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import static javacard.framework.ISO7816.SW_CONDITIONS_NOT_SATISFIED;
import static javacard.framework.ISO7816.SW_SECURITY_STATUS_NOT_SATISFIED;
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
}