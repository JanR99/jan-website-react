package de.jan.security;

import de.jan.config.CloudRun;
import de.jan.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtService {

    public static final String BEARER_PREFIX = "Bearer ";

    /** What a valid token says about its login: the id of the account, not its email address. */
    public record Token(Long userId, int version, boolean rememberMe) {
    }

    // only for local development and tests; it is in the public repo, so tokens signed with it could be forged
    static final String DEV_SECRET = "dev-only-insecure-secret-change-me-32chars!";

    private final SecretKey key;

    public JwtService(CloudRun cloudRun) {
        this.key = Keys.hmacShaKeyFor(secret(System.getenv("JWT_SECRET"), cloudRun.isActive()).getBytes());
    }

    /**
     * The secret for signing the tokens. Cloud Run doesn't start without JWT_SECRET,
     * locally the dev secret is used when it is missing.
     */
    static String secret(String jwtSecret, boolean onCloudRun) {
        if (jwtSecret != null) {
            return jwtSecret;
        }
        if (onCloudRun) {
            throw new IllegalStateException("JWT_SECRET is not set: the backend doesn't start on Cloud Run without it");
        }
        return DEV_SECRET;
    }

    // the frontend offers to renew the token shortly before it ends, so the time starts again
    private static final Duration EXPIRATION = Duration.ofHours(2);
    // for a login with "Angemeldet bleiben"; the frontend renews that token by itself on a visit
    private static final Duration REMEMBER_ME_EXPIRATION = Duration.ofDays(30);

    private static final String VERSION_CLAIM = "ver";
    private static final String REMEMBER_ME_CLAIM = "remember";

    public String generateToken(User user, boolean rememberMe) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim(VERSION_CLAIM, user.getTokenVersion())
                .claim(REMEMBER_ME_CLAIM, rememberMe)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(rememberMe ? REMEMBER_ME_EXPIRATION : EXPIRATION)))
                .signWith(key)
                .compact();
    }

    /** Throws a JwtException if the token is invalid or expired. */
    public Token parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        // a token from before these two claims existed has neither of them
        Integer version = claims.get(VERSION_CLAIM, Integer.class);
        Boolean rememberMe = claims.get(REMEMBER_ME_CLAIM, Boolean.class);
        return new Token(Long.valueOf(claims.getSubject()), version == null ? 0 : version, Boolean.TRUE.equals(rememberMe));
    }

    /**
     * A new token of the same kind as the given one: with "Angemeldet bleiben" or without.
     * Its time starts again, so this is also how a login is renewed.
     */
    public String reissueToken(User user, String token) {
        return generateToken(user, parse(token).rememberMe());
    }
}