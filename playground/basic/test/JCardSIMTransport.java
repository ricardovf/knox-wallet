package com.knox.playground.basic;

import com.knox.playground.dongle.BTChipException;
import com.knox.playground.dongle.comm.BTChipTransport;
import com.licel.jcardsim.smartcardio.CardSimulator;
import com.licel.jcardsim.utils.ByteUtil;

import javax.smartcardio.CommandAPDU;
import javax.smartcardio.ResponseAPDU;

public class JCardSIMTransport implements BTChipTransport {
    private CardSimulator simulator;
    private boolean debug;

    public JCardSIMTransport(CardSimulator simulator, boolean debug) {
        this.simulator = simulator;
        this.debug = debug;
    }

    public JCardSIMTransport(CardSimulator simulator) {
        this(simulator, false);
    }

//    @Override
    public ResponseAPDU exchange(byte[] command) throws BTChipException {
        try {
            if (debug) {
                System.out.println("SENT =>     ".concat(ByteUtil.hexString(command)));
            }
            ResponseAPDU result = simulator.transmitCommand(new CommandAPDU(command));
            if (debug) {
                System.out.println("RECEIVED <= ".concat(ByteUtil.hexString(result.getBytes())));
            }
            return result;
        }
        catch(Exception e) {
            throw new BTChipException("Simulator exception", e);
        }
    }

//    @Override
    public void close() throws BTChipException {
    }

//    @Override
    public void setDebug(boolean debugFlag) {
        this.debug = debug;
    }
}
