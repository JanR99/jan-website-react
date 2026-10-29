package de.jan.user;

import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import de.jan.objectify.DatastoreEntity;

import java.util.Date;

/**
 * The one-time token of a link in a mail. Only its SHA-256 hash is stored, the token itself exists only in the mail.
 * Not an entity itself, the fields are stored with each subclass.
 */
public abstract class MailLinkToken implements DatastoreEntity {

    @Id
    private Long id;

    @Index
    private String tokenHash;

    @Index
    private Long userId;

    private Date expiresAt;

    protected MailLinkToken() {
    }

    protected MailLinkToken(String tokenHash, Long userId, Date expiresAt) {
        this.tokenHash = tokenHash;
        this.userId = userId;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return expiresAt == null || new Date().after(expiresAt);
    }

    public Long getId() {
        return id;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public Long getUserId() {
        return userId;
    }

    public Date getExpiresAt() {
        return expiresAt;
    }
}
