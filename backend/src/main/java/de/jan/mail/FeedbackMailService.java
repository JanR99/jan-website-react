package de.jan.mail;

import de.jan.feedback.Feedback;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/** Tells the admin about new feedback; it can then be read and resolved under /konto/feedback. */
@Service
public class FeedbackMailService extends AbstractMailService<Feedback> {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm 'Uhr'");
    private static final ZoneId ZONE = ZoneId.of("Europe/Berlin");

    private final String adminEmail;

    public FeedbackMailService(BrevoMailSender mailSender, @Value("${BOOTSTRAP_ADMIN_EMAIL:}") String adminEmail) {
        super(mailSender);
        this.adminEmail = adminEmail;
    }

    @Override
    protected String getRecipient(Feedback feedback) {
        return adminEmail;
    }

    @Override
    protected String getSubject(Feedback feedback) {
        return "Neues Feedback auf jan-website.de von " + clean(feedback.getUserName());
    }

    @Override
    protected String getText(Feedback feedback) {
        return """
                Hallo Jan,

                es gibt neues Feedback:

                Von:    %s (%s)
                Seite:  %s
                Zeit:   %s

                %s

                Alles Feedback findest du unter /konto/feedback.
                """.formatted(
                clean(feedback.getUserName()),
                clean(feedback.getUserEmail()),
                feedback.getPage().isEmpty() ? "unbekannt" : feedback.getPage(),
                ZonedDateTime.ofInstant(feedback.getCreatedAt().toInstant(), ZONE).format(TIME_FORMAT),
                feedback.getText());
    }
}
