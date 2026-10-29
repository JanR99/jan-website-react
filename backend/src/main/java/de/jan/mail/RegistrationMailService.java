package de.jan.mail;

import de.jan.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class RegistrationMailService extends AdminMailService<User> {

    public RegistrationMailService(BrevoMailSender mailSender, MailTemplates templates,
                                   @Value("${BOOTSTRAP_ADMIN_EMAIL:}") String adminEmail) {
        super(mailSender, templates, adminEmail);
    }

    @Override
    protected String getRecipient(User user) {
        // no notification when the admin registers themselves (e.g. the bootstrap admin)
        String adminEmail = super.getRecipient(user);
        return adminEmail.equalsIgnoreCase(user.getEmail()) ? null : adminEmail;
    }

    @Override
    protected String getSubject(User user) {
        return "Neue Registrierung auf jan-website.de: " + name(user);
    }

    @Override
    protected MailTemplate getTemplate() {
        return MailTemplate.REGISTRATION;
    }

    @Override
    protected Map<String, Object> getVariables(User user) {
        return Map.of("name", name(user), "email", user.getEmail(), "time", time(Instant.now()));
    }

    private static String name(User user) {
        return (clean(user.getFirstname()) + " " + clean(user.getLastname())).trim();
    }
}
