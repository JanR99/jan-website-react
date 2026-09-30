package de.jan.mail;

import de.jan.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class PasswordResetMailService extends AbstractMailService<PasswordResetMailService.ResetMail> {

    public record ResetMail(User user, String token, long validMinutes) { }

    private static final String RESET_PATH = "/#/passwort-zuruecksetzen?token=";

    private final String frontendUrl;

    public PasswordResetMailService(BrevoMailSender mailSender, @Value("${FRONTEND_URL:http://localhost:5173}") String frontendUrl) {
        super(mailSender);
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Override
    protected String getRecipient(ResetMail mail) {
        return mail.user().getEmail();
    }

    @Override
    protected String getSubject(ResetMail mail) {
        return "Passwort zurücksetzen auf jan-website.de";
    }

    @Override
    protected String getText(ResetMail mail) {
        String link = frontendUrl + RESET_PATH + URLEncoder.encode(mail.token(), StandardCharsets.UTF_8);
        String firstname = clean(mail.user().getFirstname());
        String greeting = firstname.isEmpty() ? "Hallo," : "Hallo " + firstname + ",";

        return greeting + "\n\n"
                + "für dein Konto auf jan-website.de wurde ein neues Passwort angefordert.\n"
                + "Über diesen Link kannst du ein neues Passwort festlegen:\n\n"
                + link + "\n\n"
                + "Der Link ist " + mail.validMinutes() + " Minuten gültig und kann nur einmal verwendet werden.\n"
                + "Falls du das nicht warst, kannst du diese Mail einfach ignorieren – dein Passwort bleibt unverändert.\n";
    }
}
