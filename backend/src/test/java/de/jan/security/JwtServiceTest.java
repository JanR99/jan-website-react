package de.jan.security;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

    @Test
    void onCloudRunWithoutSecret_doesNotStart() {
        assertThrows(IllegalStateException.class, () -> JwtService.secret(Map.of("K_SERVICE", "jan-website-backend")));
    }

    @Test
    void onCloudRunWithSecret_usesIt() {
        assertEquals("live-secret", JwtService.secret(Map.of("K_SERVICE", "jan-website-backend", "JWT_SECRET", "live-secret")));
    }

    @Test
    void locallyWithoutSecret_usesTheDevSecret() {
        assertEquals(JwtService.DEV_SECRET, JwtService.secret(Map.of()));
    }

    @Test
    void locallyWithSecret_usesIt() {
        assertEquals("local-secret", JwtService.secret(Map.of("JWT_SECRET", "local-secret")));
    }
}
