package com.knox.playground.helloworld;

import com.licel.jcardsim.smartcardio.CardSimulator;
import com.licel.jcardsim.utils.AIDUtil;
import javacard.framework.AID;
import org.junit.jupiter.api.*;

import javax.smartcardio.CommandAPDU;
import javax.smartcardio.ResponseAPDU;

import static org.junit.jupiter.api.Assertions.*;

class HelloWorldAppletTest {
//    @BeforeAll
//    public static void testSetup() throws Exception {
//        System.setProperty("com.licel.jcardsim.card.applet.0.AID",
//                "010203040506070809");
//        System.setProperty("com.licel.jcardsim.card.applet.0.Class",
//                "com.knox.playground.helloworld.HelloWorldApplet");
//        if (Security.getProvider("jCardSim") == null) {
//            try {
//                Provider provider = (Provider) HelloWorldAppletTest.class.
//                        getClassLoader().
//                        loadClass("com.licel.jcardsim.smartcardio.JCardSimProvider").
//                        newInstance();
//                Security.addProvider(provider);
//            } catch (Exception e) {
//                e.printStackTrace();
//            }
//        }
//    }
//
//        @Test
//    void myFirstTest() {
//
//        assertEquals(1, 1);
//    }
//
//    @BeforeEach
//    void setUp() {
//    }
//
//    @AfterEach
//    void tearDown() {
//    }
//
    @Test
    void myFirstTest() {
        // 1. create simulator
        CardSimulator simulator = new CardSimulator();

        // 2. install applet
        AID appletAID = AIDUtil.create("F000000001");
        simulator.installApplet(appletAID, HelloWorldApplet.class);

        // 3. select applet
        simulator.selectApplet(appletAID);

        // 4. send APDU
        CommandAPDU commandAPDU = new CommandAPDU(0x00, 0x01, 0x00, 0x00);
        ResponseAPDU response = simulator.transmitCommand(commandAPDU);

        // 5. check response
        assertEquals(0x9000, response.getSW());
    }
}