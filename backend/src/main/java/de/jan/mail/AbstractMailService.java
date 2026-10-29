package de.jan.mail;

import java.util.Map;

public abstract class AbstractMailService<T> {

    private final BrevoMailSender mailSender;
    private final MailTemplates templates;

    protected AbstractMailService(BrevoMailSender mailSender, MailTemplates templates) {
        this.mailSender = mailSender;
        this.templates = templates;
    }

    protected abstract String getRecipient(T data);

    protected abstract String getSubject(T data);

    protected abstract MailTemplate getTemplate();

    protected abstract Map<String, Object> getVariables(T data);

    /** Who the mail comes from; a mail service can override this, e.g. for news@. */
    protected Sender sender() {
        return Sender.NO_REPLY;
    }

    public final void send(T data) {
        String recipient = getRecipient(data);
        if (recipient == null || recipient.isBlank()) {
            return;
        }
        Map<String, Object> variables = getVariables(data);
        mailSender.send(sender(), recipient, getSubject(data),
                templates.text(getTemplate(), variables), templates.html(getTemplate(), variables));
    }

    protected static String clean(String value) {
        return value == null ? "" : value.replaceAll("[\\r\\n]+", " ").trim();
    }
}
