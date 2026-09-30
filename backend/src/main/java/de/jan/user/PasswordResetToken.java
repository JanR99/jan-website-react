package de.jan.user;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import de.jan.objectify.DatastoreEntity;

import java.util.Date;

/**
 * One-time token for "Passwort vergessen". Only the SHA-256 hash of the token is stored,
 * the plain token exists only in the mail link.
 * expiresAt is a timestamp so Firestore can delete expired tokens via a TTL policy
 */
@Entity
public class PasswordResetToken implements DatastoreEntity {

    @Id
    private Long id;

    @Index
    private String tokenHash;

    @Index
    private Long userId;

    private Date expiresAt;

    public PasswordResetToken() {

    }

    public PasswordResetToken(String tokenHash, Long userId, Date expiresAt) {
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
