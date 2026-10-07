package de.jan.security;

import de.jan.exceptions.EntityStateException;
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

    /** What a valid token says about its login. */
    public record Token(String email, int version, boolean rememberMe) {
    }

    private final SecretKey key = Keys.hmacShaKeyFor(
            System.getenv().getOrDefault("JWT_SECRET", "dev-only-insecure-secret-change-me-32chars!").getBytes()
    );

    private static final Duration EXPIRATION = Duration.ofHours(2);
    // for a login with "Angemeldet bleiben"; the frontend renews the token on a visit, so the time starts again
    private static final Duration REMEMBER_ME_EXPIRATION = Duration.ofDays(30);

    private static final String VERSION_CLAIM = "ver";
    private static final String REMEMBER_ME_CLAIM = "remember";

    public String generateToken(User user, boolean rememberMe) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
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
        return new Token(claims.getSubject(), version == null ? 0 : version, Boolean.TRUE.equals(rememberMe));
    }

    /** A fresh token for a login with "Angemeldet bleiben", so its 30 days start again. */
    public String renewToken(User user, String token) {
        if (!parse(token).rememberMe()) {
            throw new EntityStateException("Only a login that stays logged in can be renewed");
        }
        return generateToken(user, true);
    }

    /** A new token of the same kind as the given one: with "Angemeldet bleiben" or without. */
    public String reissueToken(User user, String token) {
        return generateToken(user, parse(token).rememberMe());
    }
}