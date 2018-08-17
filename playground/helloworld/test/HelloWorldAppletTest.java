package com.knox.playground.helloworld;

import org.junit.Before;
import org.junit.Test;

import javax.smartcardio.CardException;
import javax.smartcardio.CommandAPDU;
import javax.smartcardio.ResponseAPDU;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;

public class HelloWorldAppletTest extends JavaCardTest {
    private final static byte[] CMD_HELLO = new byte[]{0x00, 0x01, 0x00, 0x00};

    @Before
    public void initTest() throws CardException {
        TestSuite.setup();
    }

    private void sendCmdBatch(byte[] cmd, byte[] data, int expectedSw, byte[] expectedResponse) throws CardException {
        CommandAPDU commandAPDU = new CommandAPDU(TestUtils.buildApdu(cmd, data));
        ResponseAPDU response = transmitCommand(commandAPDU);
        assertEquals(expectedSw, response.getSW());
        assertArrayEquals(expectedResponse, response.getData());
    }

    private void sendHello(byte[] data, int expectedSw, byte[] expectedResponse) throws CardException {
        sendCmdBatch(CMD_HELLO, data, expectedSw, expectedResponse);
    }

    @Test
    public void helloWorldTest() throws CardException {
        sendHello(new byte[]{}, 0x9000, "Hello world !".getBytes());
    }
}