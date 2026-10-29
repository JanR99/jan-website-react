package de.jan.user;

import com.googlecode.objectify.annotation.Entity;

import java.util.Date;

/** The link that confirms the email address of a new account. */
@Entity
public class EmailConfirmationToken extends MailLinkToken {

    @SuppressWarnings("unused")
    public EmailConfirmationToken() {
    }

    public EmailConfirmationToken(String tokenHash, Long userId, Date expiresAt) {
        super(tokenHash, userId, expiresAt);
    }
}
