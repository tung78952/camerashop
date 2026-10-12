package com.camerashop.mail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.sun.net.httpserver.HttpServer;

class BrevoEmailSenderTest {

    private HttpServer server;
    private String baseUrl;
    private int statusToReturn;
    private String receivedPath;
    private String receivedKey;
    private String receivedBody;

    @BeforeEach
    void startFakeBrevo() throws IOException {
        statusToReturn = 201;
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            receivedPath = exchange.getRequestMethod() + " " + exchange.getRequestURI().getPath();
            receivedKey = exchange.getRequestHeaders().getFirst("api-key");
            receivedBody = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            byte[] response = "{\"messageId\":\"<abc@brevo>\"}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(statusToReturn, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
        baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
    }

    @AfterEach
    void stopFakeBrevo() {
        server.stop(0);
    }

    @Test
    void sendsTheRightRequest() {
        new BrevoEmailSender("TEST-KEY", baseUrl)
                .send("CameraShop <shop@gmail.com>", "khach@test.local", "Xác nhận đơn hàng #5", "Xin chào Tùng", "<p>Xin chào <b>Tùng</b></p>");

        assertEquals("POST /v3/smtp/email", receivedPath);
        assertEquals("TEST-KEY", receivedKey);
        assertTrue(receivedBody.contains("\"sender\":{\"name\":\"CameraShop\",\"email\":\"shop@gmail.com\"}"), receivedBody);
        assertTrue(receivedBody.contains("\"to\":[{\"email\":\"khach@test.local\"}]"), receivedBody);
        assertTrue(receivedBody.contains("\"subject\":\"Xác nhận đơn hàng #5\""), receivedBody);
        assertTrue(receivedBody.contains("\"textContent\":\"Xin chào Tùng\""), receivedBody);
        assertTrue(receivedBody.contains("\"htmlContent\":\"<p>Xin chào <b>Tùng</b></p>\""), receivedBody);
        assertFalse(receivedBody.contains("null"), receivedBody);
    }

    @Test
    void brevoErrorBecomesEmailSendException() {
        statusToReturn = 401;
        BrevoEmailSender sender = new BrevoEmailSender("WRONG-KEY", baseUrl);

        assertThrows(EmailSendException.class,
                () -> sender.send("shop@gmail.com", "khach@test.local", "Tiêu đề", "Nội dung", null));
    }

    @Test
    void missingKeyFailsFast() {
        BrevoEmailSender sender = new BrevoEmailSender("", baseUrl);

        assertThrows(EmailSendException.class,
                () -> sender.send("shop@gmail.com", "khach@test.local", "Tiêu đề", "Nội dung", null));
        assertEquals(null, receivedPath);
    }

    @Test
    void parsesSenderNameAndEmail() {
        assertEquals(new BrevoEmailSender.Contact("CameraShop", "shop@gmail.com"), BrevoEmailSender.parse("CameraShop <shop@gmail.com>"));
        assertEquals(new BrevoEmailSender.Contact(null, "shop@gmail.com"), BrevoEmailSender.parse("shop@gmail.com"));
        assertEquals(new BrevoEmailSender.Contact(null, "shop@gmail.com"), BrevoEmailSender.parse("<shop@gmail.com>"));
    }
}
