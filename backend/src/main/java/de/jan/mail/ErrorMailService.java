package de.jan.mail;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

/** Tells the admin about an unexpected error in the backend, at most once an hour. */
@Service
public class ErrorMailService extends AdminMailService<ErrorMailService.ServerError> {

    public record ServerError(String method, String path, Throwable error, Instant time, int notMailed) { }

    static final Duration INTERVAL = Duration.ofHours(1);
    private static final int STACK_TRACE_LINES = 30;

    private final Clock clock;
    private Instant lastMail;
    private int notMailed;

    @Autowired
    public ErrorMailService(BrevoMailSender mailSender, MailTemplates templates,
                            @Value("${BOOTSTRAP_ADMIN_EMAIL:}") String adminEmail) {
        this(mailSender, templates, adminEmail, Clock.systemUTC());
    }

    ErrorMailService(BrevoMailSender mailSender, MailTemplates templates, String adminEmail, Clock clock) {
        super(mailSender, templates, adminEmail);
        this.clock = clock;
    }

    public void report(String method, String path, Throwable error) {
        Instant now = clock.instant();
        int skipped;
        synchronized (this) {
            if (lastMail != null && now.isBefore(lastMail.plus(INTERVAL))) {
                notMailed++;
                return;
            }
            lastMail = now;
            skipped = notMailed;
            notMailed = 0;
        }
        send(new ServerError(method, path, error, now, skipped));
    }

    @Override
    protected String getSubject(ServerError error) {
        return "Fehler im Backend von jan-website.de: " + error.error().getClass().getSimpleName();
    }

    @Override
    protected MailTemplate getTemplate() {
        return MailTemplate.SERVER_ERROR;
    }

    @Override
    protected Map<String, Object> getVariables(ServerError error) {
        return Map.of(
                "time", time(error.time()),
                "request", error.method() + " " + error.path(),
                "error", String.valueOf(error.error()),
                "stackTrace", Arrays.stream(error.error().getStackTrace())
                        .limit(STACK_TRACE_LINES)
                        .map(element -> "    at " + element)
                        .collect(Collectors.joining("\n")),
                "notMailed", error.notMailed());
    }
}
