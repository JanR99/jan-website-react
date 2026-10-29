package de.jan.mail;

import de.jan.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/** The mail with the link that confirms the email address of a new account. */
@Service
public class ConfirmationMailService extends AbstractMailService<ConfirmationMailService.ConfirmationMail> {

    public record ConfirmationMail(User user, String token, long validDays) { }

    private static final String CONFIRM_PATH = "/#/email-bestaetigen?token=";

    private final String frontendUrl;

    public ConfirmationMailService(BrevoMailSender mailSender, @Value("${FRONTEND_URL:http://localhost:5173}") String frontendUrl) {
        super(mailSender);
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Override
    protected String getRecipient(ConfirmationMail mail) {
        return mail.user().getEmail();
    }

    @Override
    protected String getSubject(ConfirmationMail mail) {
        return "Bestätige deine E-Mail-Adresse für jan-website.de";
    }

    @Override
    protected String getText(ConfirmationMail mail) {
        String link = frontendUrl + CONFIRM_PATH + URLEncoder.encode(mail.token(), StandardCharsets.UTF_8);
        String firstname = clean(mail.user().getFirstname());
        String greeting = firstname.isEmpty() ? "Hallo," : "Hallo " + firstname + ",";

        return greeting + "\n\n"
                + "schön, dass du dich auf jan-website.de registriert hast.\n"
                + "Bitte bestätige deine E-Mail-Adresse über diesen Link, danach kannst du dich anmelden:\n\n"
                + link + "\n\n"
                + "Der Link ist " + mail.validDays() + " Tage gültig. Wird das Konto bis dahin nicht bestätigt, wird es wieder gelöscht.\n"
                + "Falls du dich nicht registriert hast, kannst du diese Mail einfach ignorieren.\n";
    }
}
