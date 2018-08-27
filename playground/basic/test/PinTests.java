package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import static javacard.framework.ISO7816.SW_CONDITIONS_NOT_SATISFIED;
import static javacard.framework.ISO7816.SW_SECURITY_STATUS_NOT_SATISFIED;
import static org.junit.Assert.assertEquals;

public class PinTests extends AbstractJavaCardTest {
    @Rule
    public final ExpectedException exception = ExpectedException.none();

    BTChipDongle dongle;

    @Before
    public void beforeEach() throws BTChipException {
        dongle = prepareDongleRestoreTestnet(true);
    }

    @Test
    public void correctPinTest() throws BTChipException {
        dongle.verifyPin(DEFAULT_PIN);
    }

    @Test
    public void incorrectPinTest() throws BTChipException {
        int notGood[] = { SW_SECURITY_STATUS_NOT_SATISFIED };

        BTChipDongle dongle = prepareDongleRestoreTestnet(true);

        // No pin tried
        assertEquals(3, dongle.getVerifyPinRemainingAttempts());

        // First try
        dongle.verifyPin("6667".getBytes(), notGood);
        assertEquals(2, dongle.getVerifyPinRemainingAttempts());

        // Second try
        dongle.verifyPin("6667".getBytes(), notGood);
        assertEquals(1, dongle.getVerifyPinRemainingAttempts());

        // Last try will return error
        dongle.verifyPin("6668".getBytes(), notGood);
        assertEquals(SW_CONDITIONS_NOT_SATISFIED, dongle.getVerifyPinRemainingAttempts());
    }

    @Test
    public void incorrectThenCorrectPinTest() throws BTChipException {
        int notGood[] = { SW_SECURITY_STATUS_NOT_SATISFIED };

        BTChipDongle dongle = prepareDongleRestoreTestnet(true);

        // No pin tried
        assertEquals(3, dongle.getVerifyPinRemainingAttempts());

        // First try
        dongle.verifyPin("6667".getBytes(), notGood);
        assertEquals(2, dongle.getVerifyPinRemainingAttempts());

        // Second try (correct pin) will reset the counter
        dongle.verifyPin(DEFAULT_PIN);
        assertEquals(3, dongle.getVerifyPinRemainingAttempts());
    }
}