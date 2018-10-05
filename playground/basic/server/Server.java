package com.knox.playground.basic.server;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;

import com.knox.playground.dongle.BTChipDongle;
import com.knox.playground.dongle.BTChipException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import org.spongycastle.pqc.math.linearalgebra.ByteUtils;

public class Server {
    static class DongleInteraction extends AbstractDongleInteraction {}
    static DongleInteraction interaction;
    static BTChipDongle dongle;
    static boolean hasDevice = false;

    public static void main(String[] args) throws Exception {
        interaction = new DongleInteraction();
        dongle = interaction.getDongle(true);

        HttpServer server = HttpServer.create(new InetSocketAddress(28281), 0);
        server.createContext("/call", new CallHandler());
        server.createContext("/reset", new ResetHandler());
        server.createContext("/ping", new PingHandler());
        server.createContext("/connect-device", new ConnectDeviceHandler());
        server.createContext("/disconnect-device", new DisconnectDeviceHandler());
        server.createContext("/has-device", new HasDeviceHandler());
        server.setExecutor(null);
        server.start();
    }

    static void ensureCors(HttpExchange t) throws IOException {
        t.getResponseHeaders().add("Access-Control-Allow-Origin", "*");

        if (t.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            t.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
            t.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");
            t.sendResponseHeaders(204, -1);
            return;
        }
    }

    static class CallHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            ensureCors(t);

            String response;
            byte responseBytes[];
            int code = 200;
            if (!hasDevice) {
                // Can't call if there is no device connected
                response = "Can't call, no device connected";
                code = 405;
            } else {
                try {
                    if (!t.getRequestMethod().equals("POST")) {
                        throw new BTChipException("Only POST is supported on this method");
                    }

                    byte[] input = getInputAsBinary(t.getRequestBody());

                    if (input.length == 0) {
                        throw new BTChipException("No command found in the input data!");
                    }

                    if (input.length < 4) {
                        throw new BTChipException("Command must have at least 4 bytes!");
                    }

                    byte[] command = ByteUtils.fromHexString(new String(input));

                    // @todo check if command is valid

                    responseBytes = dongle.exchange(command, true);
                    response = ByteUtils.toHexString(responseBytes);
                } catch (BTChipException e) {
                    response = e.toString();
                    code = 500;
                } catch (Exception e) {
                    response = "An unknown Exception happened!";
                    code = 500;
                }
            }

            System.out.println("SERVER: call()");

            t.sendResponseHeaders(code, response.length());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    static class ResetHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            ensureCors(t);
            String response;
            int code = 200;

            if (!hasDevice) {
                // Can't reset if there is no device connected
                response = "Can't reset, no device connected";
                code = 405;
            } else {
                try {
                    dongle = interaction.getDongle(true);
                    response = "OK";
                } catch (BTChipException e) {
                    response = e.toString();
                    code = 500;
                } catch (Exception e) {
                    response = "An unknown Exception happened!";
                    code = 500;
                }
            }

            System.out.println("SERVER: reset()");

            t.sendResponseHeaders(code, response.length());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    static class DisconnectDeviceHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            ensureCors(t);
            String response;
            int code = 200;
            hasDevice = false;
            response = "OK";

            try {
                interaction.reset();
            } catch (BTChipException e) {
                response = e.toString();
                code = 500;
            }

            System.out.println("SERVER: disconnect device()");

            t.sendResponseHeaders(code, response.length());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    static class ConnectDeviceHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            ensureCors(t);
            String response;
            int code = 200;
            hasDevice = true;
            response = "OK";

            try {
                interaction.reset();
            } catch (BTChipException e) {
                response = e.toString();
                code = 500;
            }

            System.out.println("SERVER: connect device()");

            t.sendResponseHeaders(code, response.length());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    static class HasDeviceHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            ensureCors(t);

            String response = hasDevice ? "1" : "0";
            int code = 200;

            System.out.println("SERVER: has device()");

            t.sendResponseHeaders(code, response.length());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    static class PingHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            ensureCors(t);

            String response = "PONG";
            int code = 200;

            System.out.println("SERVER: ping()");

            t.sendResponseHeaders(code, response.length());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    public static byte[] getInputAsBinary(InputStream requestStream) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        byte[] buf = new byte[10000];
        int bytesRead=0;
        while ((bytesRead = requestStream.read(buf)) != -1){
            //while (requestStream.available() > 0) {
            //    int i = requestStream.read(buf);
            bos.write(buf, 0, bytesRead);
        }
        requestStream.close();
        bos.close();
        return bos.toByteArray();
    }
}
