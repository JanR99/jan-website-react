package de.jan.mail;

import de.jan.feedback.Feedback;
import de.jan.user.User;
import org.junit.jupiter.api.Test;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** What the notification mails to the admin say; sending itself is in BrevoMailSenderTest. */
class MailServicesTest {

    private record Mail(String to, String subject, String text) { }

    /** Keeps the mails instead of sending them. */
    private static class RecordingSender extends BrevoMailSender {
        final List<Mail> mails = new ArrayList<>();

        RecordingSender() {
            super("", "", false, null, null);
        }

        @Override
        public void send(String to, String subject, String text) {
            mails.add(new Mail(to, subject, text));
        }
    }

    private static final Date CREATED = Date.from(ZonedDateTime.of(2026, 10, 16, 13, 5, 0, 0, ZoneId.of("Europe/Berlin")).toInstant());

    @Test
    void feedback_tellsTheAdminWhoWroteWhatOnWhichPage() {
        RecordingSender sender = new RecordingSender();
        new FeedbackMailService(sender, "jan@example.com")
                .send(new Feedback(1L, "Anna\nBerg", "anna@example.com", "Tolle Seite!", "/cookbook", CREATED));

        Mail mail = sender.mails.getFirst();
        assertEquals("jan@example.com", mail.to());
        // line breaks in the name can't get into the subject
        assertEquals("Neues Feedback auf jan-website.de von Anna Berg", mail.subject());
        assertTrue(mail.text().contains("Von:    Anna Berg (anna@example.com)"));
        assertTrue(mail.text().contains("Seite:  /cookbook"));
        assertTrue(mail.text().contains("Zeit:   16.10.2026 13:05 Uhr"));
        assertTrue(mail.text().contains("Tolle Seite!"));
    }

    @Test
    void feedbackWithoutPage_saysUnknown() {
        RecordingSender sender = new RecordingSender();
        new FeedbackMailService(sender, "jan@example.com")
                .send(new Feedback(1L, null, null, "Hallo", null, CREATED));

        Mail mail = sender.mails.getFirst();
        assertEquals("Neues Feedback auf jan-website.de von ", mail.subject());
        assertTrue(mail.text().contains("Seite:  unbekannt"));
    }

    @Test
    void withoutAdminAddress_sendsNothing() {
        RecordingSender sender = new RecordingSender();
        new FeedbackMailService(sender, "").send(new Feedback(1L, "Anna", "anna@example.com", "Hallo", "/", CREATED));
        new RegistrationMailService(sender, "").send(new User("anna@example.com", "hash", "Anna", "Berg"));

        assertTrue(sender.mails.isEmpty());
    }

    @Test
    void registration_tellsTheAdminWhoRegistered() {
        RecordingSender sender = new RecordingSender();
        new RegistrationMailService(sender, "jan@example.com").send(new User("anna@example.com", "hash", " Anna ", "Berg"));

        Mail mail = sender.mails.getFirst();
        assertEquals("jan@example.com", mail.to());
        assertEquals("Neue Registrierung auf jan-website.de: Anna Berg", mail.subject());
        assertTrue(mail.text().contains("Name:    Anna Berg"));
        assertTrue(mail.text().contains("E-Mail:  anna@example.com"));
        assertTrue(mail.text().contains("Uhr"));
    }

    @Test
    void adminRegisteringThemselves_getsNoMail() {
        RecordingSender sender = new RecordingSender();
        new RegistrationMailService(sender, "jan@example.com").send(new User("JAN@example.com", "hash", "Jan", "R"));

        assertTrue(sender.mails.isEmpty());
    }
}
