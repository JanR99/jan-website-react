package de.jan.user;

public class PasswordResetTokenDAO extends MailLinkTokenDAO<PasswordResetToken> {

    public PasswordResetTokenDAO() {
        super(PasswordResetToken.class);
    }
}
