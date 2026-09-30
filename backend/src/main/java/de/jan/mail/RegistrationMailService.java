package de.jan.mail;

import de.jan.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class RegistrationMailService extends AbstractMailService<User> {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm 'Uhr'");
    private static final ZoneId ZONE = ZoneId.of("Europe/Berlin");

    private final String adminEmail;

    public RegistrationMailService(BrevoMailSender mailSender, @Value("${BOOTSTRAP_ADMIN_EMAIL:}") String adminEmail) {
        super(mailSender);
        this.adminEmail = adminEmail;
    }

    @Override
    protected String getRecipient(User user) {
        return adminEmail;
    }

    @Override
    protected String getSubject(User user) {
        return "Neue Registrierung auf jan-website.de: " + name(user);
    }

    @Override
    protected String getText(User user) {
        return """
                Hallo Jan,

                es hat sich gerade jemand neu registriert:

                Name:    %s
                E-Mail:  %s
                Zeit:    %s
                """.formatted(name(user), user.getEmail(), ZonedDateTime.now(ZONE).format(TIME_FORMAT));
    }

    private static String name(User user) {
        return (clean(user.getFirstname()) + " " + clean(user.getLastname())).trim();
    }
}
