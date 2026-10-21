package de.jan.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

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
