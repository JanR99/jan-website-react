package de.jan.mail;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/** A notification to the admin */
public abstract class AdminMailService<T> extends AbstractMailService<T> {

    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm 'Uhr'").withZone(ZoneId.of("Europe/Berlin"));

    private final String adminEmail;

    protected AdminMailService(BrevoMailSender mailSender, MailTemplates templates, String adminEmail) {
        super(mailSender, templates);
        this.adminEmail = adminEmail;
    }

    @Override
    protected String getRecipient(T data) {
        return adminEmail;
    }

    protected static String time(Instant instant) {
        return TIME_FORMAT.format(instant);
    }
}
