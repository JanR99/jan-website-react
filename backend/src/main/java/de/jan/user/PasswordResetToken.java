package de.jan.user;

import com.googlecode.objectify.annotation.Entity;

import java.util.Date;

/** The link of "Passwort vergessen". expiresAt is a timestamp so Firestore can delete expired tokens via a TTL policy. */
@Entity
public class PasswordResetToken extends MailLinkToken {

    @SuppressWarnings("unused")
    public PasswordResetToken() {
    }

    public PasswordResetToken(String tokenHash, Long userId, Date expiresAt) {
        super(tokenHash, userId, expiresAt);
    }
}
