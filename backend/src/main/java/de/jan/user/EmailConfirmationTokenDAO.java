package de.jan.user;

public class EmailConfirmationTokenDAO extends MailLinkTokenDAO<EmailConfirmationToken> {

    public EmailConfirmationTokenDAO() {
        super(EmailConfirmationToken.class);
    }
}
