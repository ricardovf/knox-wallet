package com.knox.playground.helloworld;

import javax.smartcardio.CardException;
import javax.smartcardio.CommandAPDU;
import javax.smartcardio.ResponseAPDU;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

public class JavaCardTest {

    public ResponseAPDU transmitCommand(CommandAPDU data) throws CardException {
        if (System.getProperty("testMode") != null && System.getProperty("testMode").equals("smartcard")) {
            return TestSuite.getCard().getBasicChannel().transmit(data);
        } else {
            return TestSuite.getSimulator().transmitCommand(data);
        }
    }

    protected void sendCmdBatch(byte[] cmd, byte[] data, int expectedSw, byte[] expectedResponse) throws CardException {
        CommandAPDU commandAPDU = new CommandAPDU(TestUtils.buildApdu(cmd, data));
        ResponseAPDU response = transmitCommand(commandAPDU);
        assertEquals(expectedSw, response.getSW());
        assertArrayEquals(expectedResponse, response.getData());
    }
}