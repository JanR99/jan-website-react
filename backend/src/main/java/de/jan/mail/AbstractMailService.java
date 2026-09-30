package de.jan.mail;

public abstract class AbstractMailService<T> {

    private final BrevoMailSender mailSender;

    protected AbstractMailService(BrevoMailSender mailSender) {
        this.mailSender = mailSender;
    }

    protected abstract String getRecipient(T data);

    protected abstract String getSubject(T data);

    protected abstract String getText(T data);

    public final void send(T data) {
        String recipient = getRecipient(data);
        if (recipient == null || recipient.isBlank()) {
            return;
        }
        mailSender.send(recipient, getSubject(data), getText(data));
    }

    protected static String clean(String value) {
        return value == null ? "" : value.replaceAll("[\\r\\n]+", " ").trim();
    }
}
