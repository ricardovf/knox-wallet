package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import static javacard.framework.ISO7816.SW_CONDITIONS_NOT_SATISFIED;
import static javacard.framework.ISO7816.SW_SECURITY_STATUS_NOT_SATISFIED;
import static junit.framework.TestCase.fail;
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
        assertEquals(5, dongle.getVerifyPinRemainingAttempts());

        // 1 try
        dongle.verifyPin("6667".getBytes(), notGood);
        assertEquals(4, dongle.getVerifyPinRemainingAttempts());

        // 2 try
        dongle.verifyPin("6667".getBytes(), notGood);
        assertEquals(3, dongle.getVerifyPinRemainingAttempts());

        // 3 try
        dongle.verifyPin("6627".getBytes(), notGood);
        assertEquals(2, dongle.getVerifyPinRemainingAttempts());

        // 4 try
        dongle.verifyPin("6367".getBytes(), notGood);
        assertEquals(1, dongle.getVerifyPinRemainingAttempts());

        // Last try will return error
        dongle.verifyPin("1668".getBytes(), notGood);
        assertEquals(SW_CONDITIONS_NOT_SATISFIED, dongle.getVerifyPinRemainingAttempts());
    }

    @Test
    public void incorrectThenCorrectPinTest() throws BTChipException {
        int notGood[] = { SW_SECURITY_STATUS_NOT_SATISFIED };

        BTChipDongle dongle = prepareDongleRestoreTestnet(true);

        // No pin tried
        assertEquals(5, dongle.getVerifyPinRemainingAttempts());

        // First try
        dongle.verifyPin("6667".getBytes(), notGood);
        assertEquals(4, dongle.getVerifyPinRemainingAttempts());

        // Second try (correct pin) will reset the counter
        dongle.verifyPin(DEFAULT_PIN);
        assertEquals(5, dongle.getVerifyPinRemainingAttempts());
    }

    @Test(expected = BTChipException.class)
    public void changePinWithoutPinEntryTest() throws BTChipException {
        dongle.changePin(ALTERNATIVE_PIN);
    }

    @Test
    public void changePinTest() throws BTChipException {
        dongle.verifyPin(DEFAULT_PIN);
        dongle.changePin(ALTERNATIVE_PIN);

        try {
            // Can't change pin without validating the new pin
            dongle.changePin(DEFAULT_PIN);
            fail();
        } catch (BTChipException e) {

        }

        dongle.verifyPin(ALTERNATIVE_PIN);
        dongle.changePin(DEFAULT_PIN);
        dongle.verifyPin(DEFAULT_PIN);
    }

    @Test
    public void newPinOnWalletModeTest() throws BTChipException {
        dongle = prepareDongle(true);

        // Can't verify PIN cause there is not one set
        try {
            dongle.verifyPin(DEFAULT_PIN);
            fail();
        } catch (BTChipException e) {}

        // Can set the new PIN cause there is not one set
        dongle.changePin(DEFAULT_PIN);

        try {
            // Can't change pin without validating the new pin
            dongle.changePin(ALTERNATIVE_PIN);
            fail();
        } catch (BTChipException e) {}

        dongle.verifyPin(DEFAULT_PIN);
        dongle.changePin(ALTERNATIVE_PIN);
        dongle.verifyPin(ALTERNATIVE_PIN);
    }
}