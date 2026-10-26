package de.jan.security;

import de.jan.config.CloudRun;
import de.jan.user.User;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService(new CloudRun());

    private static User user(long id, int tokenVersion) {
        User user = new User();
        user.setId(id);
        user.setTokenVersion(tokenVersion);
        return user;
    }

    private SecretKey key() {
        return (SecretKey) ReflectionTestUtils.getField(jwtService, "key");
    }

    private static Date minutesFromNow(int minutes) {
        return new Date(System.currentTimeMillis() + minutes * 60_000L);
    }

    @Test
    void generatedToken_readsBackAsTheAccountItsVersionAndTheKindOfLogin() {
        assertEquals(new JwtService.Token(7L, 3, false), jwtService.parse(jwtService.generateToken(user(7, 3), false)));
        assertEquals(new JwtService.Token(7L, 3, true), jwtService.parse(jwtService.generateToken(user(7, 3), true)));
    }

    @Test
    void reissueToken_keepsTheKindOfLogin_andTakesTheCurrentVersion() {
        String staysLoggedIn = jwtService.generateToken(user(7, 3), true);
        String endsAfterTwoHours = jwtService.generateToken(user(7, 3), false);

        assertEquals(new JwtService.Token(7L, 4, true), jwtService.parse(jwtService.reissueToken(user(7, 4), staysLoggedIn)));
        assertEquals(new JwtService.Token(7L, 4, false), jwtService.parse(jwtService.reissueToken(user(7, 4), endsAfterTwoHours)));
    }

    @Test
    void tokenSignedWithAnotherKey_isRejected() {
        SecretKey otherKey = Keys.hmacShaKeyFor("another-secret-that-is-long-enough-32!".getBytes());
        String forged = Jwts.builder().subject("7").claim("ver", 3).expiration(minutesFromNow(60)).signWith(otherKey).compact();

        assertThrows(JwtException.class, () -> jwtService.parse(forged));
    }

    @Test
    void expiredToken_isRejected() {
        String expired = Jwts.builder().subject("7").claim("ver", 3).expiration(minutesFromNow(-1)).signWith(key()).compact();

        assertThrows(ExpiredJwtException.class, () -> jwtService.parse(expired));
    }

    @Test
    void tokenWithoutVersionAndRememberMe_countsAsVersion0WithoutRememberMe() {
        String old = Jwts.builder().subject("7").expiration(minutesFromNow(60)).signWith(key()).compact();

        assertEquals(new JwtService.Token(7L, 0, false), jwtService.parse(old));
    }

    @Test
    void onCloudRunWithoutSecret_doesNotStart() {
        assertThrows(IllegalStateException.class, () -> JwtService.secret(null, true));
    }

    @Test
    void onCloudRunWithSecret_usesIt() {
        assertEquals("live-secret", JwtService.secret("live-secret", true));
    }

    @Test
    void locallyWithoutSecret_usesTheDevSecret() {
        assertEquals(JwtService.DEV_SECRET, JwtService.secret(null, false));
    }

    @Test
    void locallyWithSecret_usesIt() {
        assertEquals("local-secret", JwtService.secret("local-secret", false));
    }
}
