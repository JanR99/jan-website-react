package de.jan.mail;

import de.jan.feedback.Feedback;
import de.jan.user.User;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** What the mails say: the notifications to the admin and the reset link; sending itself is in BrevoMailSenderTest. */
class MailServicesTest {

    private record Mail(String to, String subject, String text, String html) { }

    /** Keeps the mails instead of sending them. */
    private static class RecordingSender extends BrevoMailSender {
        final List<Mail> mails = new ArrayList<>();

        RecordingSender() {
            super("", "", false, null, null);
        }

        @Override
        public void send(Sender sender, String to, String subject, String text, String html) {
            mails.add(new Mail(to, subject, text, html));
        }
    }

    private static final MailTemplates TEMPLATES = new MailTemplates();

    private static final Date CREATED = Date.from(ZonedDateTime.of(2026, 10, 16, 13, 5, 0, 0, ZoneId.of("Europe/Berlin")).toInstant());

    @Test
    void feedback_tellsTheAdminWhoWroteWhatOnWhichPage() {
        RecordingSender sender = new RecordingSender();
        new FeedbackMailService(sender, TEMPLATES, "jan@example.com")
                .send(new Feedback(1L, "Anna\nBerg", "anna@example.com", "Tolle Seite!", "/cookbook", CREATED));

        Mail mail = sender.mails.getFirst();
        assertEquals("jan@example.com", mail.to());
        // line breaks in the name can't get into the subject
        assertEquals("Neues Feedback auf jan-website.de von Anna Berg", mail.subject());
        assertTrue(mail.text().contains("Von:    Anna Berg (anna@example.com)"));
        assertTrue(mail.text().contains("Seite:  /cookbook"));
        assertTrue(mail.text().contains("Zeit:   16.10.2026 13:05 Uhr"));
        assertTrue(mail.text().contains("Tolle Seite!"));
        assertTrue(mail.html().contains("Anna Berg (anna@example.com)"));
    }

    @Test
    void feedbackWithoutPage_saysUnknown() {
        RecordingSender sender = new RecordingSender();
        new FeedbackMailService(sender, TEMPLATES, "jan@example.com")
                .send(new Feedback(1L, null, null, "Hallo", null, CREATED));

        Mail mail = sender.mails.getFirst();
        assertEquals("Neues Feedback auf jan-website.de von ", mail.subject());
        assertTrue(mail.text().contains("Seite:  unbekannt"));
    }

    @Test
    void withoutAdminAddress_sendsNothing() {
        RecordingSender sender = new RecordingSender();
        new FeedbackMailService(sender, TEMPLATES, "").send(new Feedback(1L, "Anna", "anna@example.com", "Hallo", "/", CREATED));
        new RegistrationMailService(sender, TEMPLATES, "").send(new User("anna@example.com", "hash", "Anna", "Berg"));

        assertTrue(sender.mails.isEmpty());
    }

    @Test
    void registration_tellsTheAdminWhoRegistered() {
        RecordingSender sender = new RecordingSender();
        new RegistrationMailService(sender, TEMPLATES, "jan@example.com").send(new User("anna@example.com", "hash", " Anna ", "Berg"));

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
        new RegistrationMailService(sender, TEMPLATES, "jan@example.com").send(new User("JAN@example.com", "hash", "Jan", "R"));

        assertTrue(sender.mails.isEmpty());
    }

    /** A clock that only moves when told to. */
    private static class TestClock extends Clock {
        Instant now = CREATED.toInstant();

        @Override
        public ZoneId getZone() { return ZoneId.of("UTC"); }

        @Override
        public Clock withZone(ZoneId zone) { return this; }

        @Override
        public Instant instant() { return now; }
    }

    @Test
    void serverError_tellsTheAdminWhatFailedWhere() {
        RecordingSender sender = new RecordingSender();
        new ErrorMailService(sender, TEMPLATES, "jan@example.com", new TestClock())
                .report("GET", "/api/recipes/list", new IllegalStateException("kaputt"));

        Mail mail = sender.mails.getFirst();
        assertEquals("jan@example.com", mail.to());
        assertEquals("Fehler im Backend von jan-website.de: IllegalStateException", mail.subject());
        assertTrue(mail.text().contains("Anfrage:  GET /api/recipes/list"));
        assertTrue(mail.text().contains("Fehler:   java.lang.IllegalStateException: kaputt"));
        assertTrue(mail.text().contains("    at de.jan.mail.MailServicesTest"));
        assertTrue(mail.text().contains("Zeit:     16.10.2026 13:05 Uhr"));
    }

    @Test
    void serverErrors_areMailedAtMostOnceAnHour() {
        RecordingSender sender = new RecordingSender();
        TestClock clock = new TestClock();
        ErrorMailService service = new ErrorMailService(sender, TEMPLATES, "jan@example.com", clock);

        service.report("GET", "/a", new RuntimeException());
        clock.now = clock.now.plus(Duration.ofMinutes(30));
        service.report("GET", "/b", new RuntimeException());
        service.report("GET", "/c", new RuntimeException());
        assertEquals(1, sender.mails.size());
        assertFalse(sender.mails.getFirst().text().contains("weitere Fehler"));

        clock.now = clock.now.plus(ErrorMailService.INTERVAL);
        service.report("GET", "/d", new RuntimeException());
        assertEquals(2, sender.mails.size());
        assertTrue(sender.mails.get(1).text().contains("noch 2 weitere Fehler ohne Mail"));
    }

    @Test
    void passwordReset_sendsTheLinkToTheAccount() {
        RecordingSender sender = new RecordingSender();
        new PasswordResetMailService(sender, TEMPLATES, "https://jan-website.de/")
                .send(new LinkMailService.LinkMail(new User("anna@example.com", "hash", "Anna", "Berg"), "a+b/c=", 30));

        Mail mail = sender.mails.getFirst();
        assertEquals("anna@example.com", mail.to());
        assertEquals("Passwort zurücksetzen auf jan-website.de", mail.subject());
        assertTrue(mail.text().startsWith("Hallo Anna,"));
        // no double slash from the trailing one, and the token is encoded for the address
        assertTrue(mail.text().contains("https://jan-website.de/#/passwort-zuruecksetzen?token=a%2Bb%2Fc%3D\n"));
        assertTrue(mail.text().contains("30 Minuten gültig"));
        assertTrue(mail.html().contains("<p>Hallo Anna,</p>"));
        assertTrue(mail.html().contains("href=\"https://jan-website.de/#/passwort-zuruecksetzen?token=a%2Bb%2Fc%3D\""));
    }

    @Test
    void confirmation_sendsTheLinkToTheNewAccount() {
        RecordingSender sender = new RecordingSender();
        new ConfirmationMailService(sender, TEMPLATES, "https://jan-website.de/")
                .send(new LinkMailService.LinkMail(new User("anna@example.com", "hash", "Anna", "Berg"), "a+b/c=", 7));

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
        new PasswordResetMailService(sender, TEMPLATES, "http://localhost:5173")
                .send(new LinkMailService.LinkMail(new User("anna@example.com", "hash", " ", "Berg"), "token", 30));

        Mail mail = sender.mails.getFirst();
        assertTrue(mail.text().startsWith("Hallo,"));
        assertTrue(mail.html().contains("<p>Hallo,</p>"));
    }
}
