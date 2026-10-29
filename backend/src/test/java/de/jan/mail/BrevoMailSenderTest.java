package de.jan.mail;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import static org.junit.jupiter.api.Assertions.*;

/** Sending through the Brevo API, against a small local server that stands in for Brevo. */
class BrevoMailSenderTest {

    /** what the server got: the api-key header and the body */
    private record Received(String apiKey, String body) { }

    private HttpServer server;
    // filled on the thread of the server
    private final List<Received> received = new CopyOnWriteArrayList<>();
    private int status = 201;

    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/v3/smtp/email", exchange -> {
            try (InputStream in = exchange.getRequestBody()) {
                received.add(new Received(exchange.getRequestHeaders().getFirst("api-key"),
                        new String(in.readAllBytes(), StandardCharsets.UTF_8)));
            }
            byte[] answer = "{}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(status, answer.length);
            try (OutputStream out = exchange.getResponseBody()) {
                out.write(answer);
            }
        });
        server.start();
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    private URI api() {
        return URI.create("http://localhost:" + server.getAddress().getPort() + "/v3/smtp/email");
    }

    private BrevoMailSender sender(String apiKey, String mailDomain, boolean onCloudRun, URI api) {
        return new BrevoMailSender(apiKey, mailDomain, onCloudRun, api, HttpClient.newHttpClient());
    }

    @Test
    void onCloudRun_postsTheMailToBrevo() {
        sender("secret-key", "example.com", true, api()).send(Sender.NO_REPLY, "anna@example.com", "Hallo", "Wie geht's?", "<p>Wie geht's?</p>");

        assertEquals(1, received.size());
        assertEquals("secret-key", received.getFirst().apiKey());
        JsonNode body = new ObjectMapper().readTree(received.getFirst().body());
        assertEquals("Jans Website", body.get("sender").get("name").asString());
        assertEquals("noreply@example.com", body.get("sender").get("email").asString());
        assertEquals("anna@example.com", body.get("to").get(0).get("email").asString());
        assertEquals("Hallo", body.get("subject").asString());
        assertEquals("Wie geht's?", body.get("textContent").asString());
        assertEquals("<p>Wie geht's?</p>", body.get("htmlContent").asString());
    }

    @Test
    void outsideCloudRun_onlyLogsTheMail() {
        sender("secret-key", "example.com", false, api()).send(Sender.NO_REPLY, "anna@example.com", "Hallo", "Text", "<p>Text</p>");

        assertTrue(received.isEmpty());
    }

    @Test
    void withoutApiKeyOrMailDomain_sendsNothing() {
        sender("", "example.com", true, api()).send(Sender.NO_REPLY, "anna@example.com", "Hallo", "Text", "<p>Text</p>");
        sender("secret-key", " ", true, api()).send(Sender.NO_REPLY, "anna@example.com", "Hallo", "Text", "<p>Text</p>");

        assertTrue(received.isEmpty());
    }

    @Test
    void refusedMail_isOnlyLogged() {
        status = 400;

        assertDoesNotThrow(() -> sender("secret-key", "example.com", true, api()).send(Sender.NO_REPLY, "anna@example.com", "Hallo", "Text", "<p>Text</p>"));
        assertEquals(1, received.size());
    }

    @Test
    void unreachableBrevo_isOnlyLogged() throws IOException {
        int closedPort;
        try (ServerSocket socket = new ServerSocket(0)) {
            closedPort = socket.getLocalPort();
        }
        URI nobody = URI.create("http://localhost:" + closedPort + "/v3/smtp/email");

        assertDoesNotThrow(() -> sender("secret-key", "example.com", true, nobody).send(Sender.NO_REPLY, "anna@example.com", "Hallo", "Text", "<p>Text</p>"));
    }

    @Test
    void interruptedWhileSending_keepsTheThreadInterrupted() {
        Thread.currentThread().interrupt();
        try {
            sender("secret-key", "example.com", true, api()).send(Sender.NO_REPLY, "anna@example.com", "Hallo", "Text", "<p>Text</p>");
            assertTrue(Thread.currentThread().isInterrupted());
        } finally {
            // clears the flag again for the next tests
            Thread.interrupted();
        }
    }
}
