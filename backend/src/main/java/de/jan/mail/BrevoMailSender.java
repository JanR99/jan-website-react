package de.jan.mail;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
public class BrevoMailSender {

    private static final Logger log = LoggerFactory.getLogger(BrevoMailSender.class);
    private static final URI BREVO_API = URI.create("https://api.brevo.com/v3/smtp/email");
    private static final String SENDER_NAME = "jan-website.de";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final String apiKey;
    private final String senderEmail;

    public BrevoMailSender(
            @Value("${BREVO_API_KEY:}") String apiKey,
            @Value("${BOOTSTRAP_ADMIN_EMAIL:}") String senderEmail
    ) {
        this.apiKey = apiKey;
        this.senderEmail = senderEmail;
    }

    public void send(String to, String subject, String text) {
        if (to.equals(senderEmail)) {
            return;
        }
        if (apiKey.isBlank() || senderEmail.isBlank()) {
            log.info("Mail skipped (BREVO_API_KEY or BOOTSTRAP_ADMIN_EMAIL not set): \"{}\" to {}", subject, to);
            return;
        }

        try {
            String body = objectMapper.writeValueAsString(Map.of(
                    "sender", Map.of("name", SENDER_NAME, "email", senderEmail),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "textContent", text
            ));

            HttpRequest request = HttpRequest.newBuilder(BREVO_API)
                    .timeout(Duration.ofSeconds(5))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                log.warn("Mail \"{}\" to {} failed: HTTP {} {}", subject, to, response.statusCode(), response.body());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Mail \"{}\" to {} interrupted", subject, to);
        } catch (Exception e) {
            log.warn("Mail \"{}\" to {} could not be sent: {}", subject, to, e.getMessage());
        }
    }
}
