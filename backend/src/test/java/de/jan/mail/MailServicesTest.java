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

/** What the mails say: the notifications to the admin and the reset link; sending itself is in BrevoMailSenderTest. */
class MailServicesTest {

    private record Mail(String to, String subject, String text) { }

    /** Keeps the mails instead of sending them. */
    private static class RecordingSender extends BrevoMailSender {
        final List<Mail> mails = new ArrayList<>();

        RecordingSender() {
            super("", "", false, null, null);
        }

        @Override
        public void send(Sender sender, String to, String subject, String text) {
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

    @Test
    void passwordReset_sendsTheLinkToTheAccount() {
        RecordingSender sender = new RecordingSender();
        new PasswordResetMailService(sender, "https://jan-website.de/")
                .send(new PasswordResetMailService.ResetMail(new User("anna@example.com", "hash", "Anna", "Berg"), "a+b/c=", 30));

        Mail mail = sender.mails.getFirst();
        assertEquals("anna@example.com", mail.to());
        assertEquals("Passwort zurücksetzen auf jan-website.de", mail.subject());
        assertTrue(mail.text().startsWith("Hallo Anna,"));
        // no double slash from the trailing one, and the token is encoded for the address
        assertTrue(mail.text().contains("https://jan-website.de/#/passwort-zuruecksetzen?token=a%2Bb%2Fc%3D\n"));
        assertTrue(mail.text().contains("30 Minuten gültig"));
    }

    @Test
    void confirmation_sendsTheLinkToTheNewAccount() {
        RecordingSender sender = new RecordingSender();
        new ConfirmationMailService(sender, "https://jan-website.de/")
                .send(new ConfirmationMailService.ConfirmationMail(new User("anna@example.com", "hash", "Anna", "Berg"), "a+b/c=", 7));

        Mail mail = sender.mails.getFirst();
        assertEquals("anna@example.com", mail.to());
        assertEquals("Bestätige deine E-Mail-Adresse für jan-website.de", mail.subject());
        assertTrue(mail.text().startsWith("Hallo Anna,"));
        assertTrue(mail.text().contains("https://jan-website.de/#/email-bestaetigen?token=a%2Bb%2Fc%3D\n"));
        assertTrue(mail.text().contains("7 Tage gültig"));
    }

    @Test
    void passwordResetWithoutFirstName_greetsWithoutName() {
        RecordingSender sender = new RecordingSender();
        new PasswordResetMailService(sender, "http://localhost:5173")
                .send(new PasswordResetMailService.ResetMail(new User("anna@example.com", "hash", " ", "Berg"), "token", 30));

        Mail mail = sender.mails.getFirst();
        assertTrue(mail.text().startsWith("Hallo,"));
    }
}
