package de.jan.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetMailService extends LinkMailService {

    public PasswordResetMailService(BrevoMailSender mailSender, MailTemplates templates,
                                    @Value("${FRONTEND_URL:http://localhost:5173}") String frontendUrl) {
        super(mailSender, templates, frontendUrl);
    }

    @Override
    protected String getPath() {
        return "/#/passwort-zuruecksetzen?token=";
    }

    @Override
    protected String getSubject(LinkMail mail) {
        return "Passwort zurücksetzen auf jan-website.de";
    }

    @Override
    protected MailTemplate getTemplate() {
        return MailTemplate.PASSWORD_RESET;
    }
}
