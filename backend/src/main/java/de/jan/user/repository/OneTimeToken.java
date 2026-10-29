package de.jan.user.repository;

import com.google.common.hash.Hashing;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * The random tokens of mail links (password reset, email confirmation) and the hash that is stored of them.
 */
record OneTimeToken(String token) {

    public OneTimeToken() {
        this(UUID.randomUUID().toString());
    }

    public String hash() {
        return Hashing.sha256().hashString(this.token, StandardCharsets.UTF_8).toString();
    }
}
