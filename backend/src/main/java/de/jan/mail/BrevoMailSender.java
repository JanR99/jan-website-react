package de.jan.mail;

import de.jan.config.CloudRun;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

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

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;
    private final URI api;
    private final String apiKey;
    private final String mailDomain;

    /**
     * Mails only leave the machine on Cloud Run. Started locally
     * (start-dev) or in tests, a mail is written to the log instead, whatever is in the .env.
     */
    private final boolean onCloudRun;

    @Autowired
    public BrevoMailSender(
            @Value("${BREVO_API_KEY:}") String apiKey,
            @Value("${mail.domain:}") String mailDomain,
            CloudRun cloudRun
    ) {
        this(apiKey, mailDomain, cloudRun.isActive(), BREVO_API,
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
    }

    /** With another address and client, and sending also outside Cloud Run: for tests against a local server. */
    BrevoMailSender(String apiKey, String mailDomain, boolean onCloudRun, URI api, HttpClient httpClient) {
        this.apiKey = apiKey;
        this.mailDomain = mailDomain;
        this.onCloudRun = onCloudRun;
        this.api = api;
        this.httpClient = httpClient;
    }

    public void send(Sender sender, String to, String subject, String text) {
        if (!onCloudRun) {
            // with the text, so e.g. the link of a password reset mail can be used locally
            log.info("Mail not sent (not running on Cloud Run): \"{}\" from {} to {}\n{}", subject, sender.localPart(), to, text);
            return;
        }
        if (apiKey.isBlank() || mailDomain.isBlank()) {
            log.info("Mail skipped (BREVO_API_KEY or mail.domain not set): \"{}\" to {}", subject, to);
            return;
        }

        try {
            String body = objectMapper.writeValueAsString(Map.of(
                    "sender", Map.of("name", sender.displayName(), "email", sender.localPart() + "@" + mailDomain),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "textContent", text
            ));

            HttpRequest request = HttpRequest.newBuilder(api)
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
