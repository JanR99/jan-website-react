package de.jan.mail;

import de.jan.feedback.Feedback;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

/** Tells the admin about new feedback; it can then be read and resolved under /konto/feedback. */
@Service
public class FeedbackMailService extends AdminMailService<Feedback> {

    public FeedbackMailService(BrevoMailSender mailSender, MailTemplates templates,
                               @Value("${BOOTSTRAP_ADMIN_EMAIL:}") String adminEmail) {
        super(mailSender, templates, adminEmail);
    }

    @Override
    protected String getSubject(Feedback feedback) {
        return "Neues Feedback auf jan-website.de von " + clean(feedback.getUserName());
    }

    @Override
    protected MailTemplate getTemplate() {
        return MailTemplate.FEEDBACK;
    }

    @Override
    protected Map<String, Object> getVariables(Feedback feedback) {
        return Map.of(
                "name", clean(feedback.getUserName()),
                "email", clean(feedback.getUserEmail()),
                "page", feedback.getPage().isEmpty() ? "unbekannt" : feedback.getPage(),
                "time", time(feedback.getCreatedAt().toInstant()),
                "text", feedback.getText());
    }
}
