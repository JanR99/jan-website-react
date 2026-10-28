package de.jan.mail;

public abstract class AbstractMailService<T> {

    private final BrevoMailSender mailSender;

    protected AbstractMailService(BrevoMailSender mailSender) {
        this.mailSender = mailSender;
    }

    protected abstract String getRecipient(T data);

    protected abstract String getSubject(T data);

    protected abstract String getText(T data);

    /** Who the mail comes from; a mail service can override this, e.g. for news@. */
    protected Sender sender() {
        return Sender.NO_REPLY;
    }

    public final void send(T data) {
        String recipient = getRecipient(data);
        if (recipient == null || recipient.isBlank()) {
            return;
        }
        mailSender.send(sender(), recipient, getSubject(data), getText(data));
    }

    protected static String clean(String value) {
        return value == null ? "" : value.replaceAll("[\\r\\n]+", " ").trim();
    }
}
