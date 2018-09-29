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

    public static void main(String[] args) throws Exception {
        interaction = new DongleInteraction();
        dongle = interaction.prepareDongle(true);

        HttpServer server = HttpServer.create(new InetSocketAddress(28281), 0);
        server.createContext("/call", new CallHandler());
        server.createContext("/reset", new ResetHandler());
        server.createContext("/ping", new PingHandler());
        server.setExecutor(null);
        server.start();
    }

    static class CallHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            t.getResponseHeaders().add("Access-Control-Allow-Origin", "*");

            if (t.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                t.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
                t.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");
                t.sendResponseHeaders(204, -1);
                return;
            }

            String response;
            byte responseBytes[];
            int code = 200;
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

            t.sendResponseHeaders(code, response.length());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    static class ResetHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            String response;
            int code = 200;
            try {
                dongle = interaction.prepareDongle(true);
                response = "OK";
            } catch (BTChipException e) {
                response = e.toString();
                code = 500;
            } catch (Exception e) {
                response = "An unknown Exception happened!";
                code = 500;
            }

            t.sendResponseHeaders(code, response.length());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    static class PingHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            String response = "knox";
            int code = 200;

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
