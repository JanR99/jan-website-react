package de.jan.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** The mail with the link that confirms the email address of a new account. */
@Service
public class ConfirmationMailService extends LinkMailService {

    public ConfirmationMailService(BrevoMailSender mailSender, MailTemplates templates,
                                   @Value("${FRONTEND_URL:http://localhost:5173}") String frontendUrl) {
        super(mailSender, templates, frontendUrl);
    }

    @Override
    protected String getPath() {
        return "/#/email-bestaetigen?token=";
    }

    @Override
    protected String getSubject(LinkMail mail) {
        return "Bestätige deine E-Mail-Adresse für jan-website.de";
    }

    @Override
    protected MailTemplate getTemplate() {
        return MailTemplate.CONFIRMATION;
    }
}
