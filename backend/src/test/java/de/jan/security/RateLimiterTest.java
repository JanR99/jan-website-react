package de.jan.security;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RateLimiterTest {

    private static final Duration MINUTE = Duration.ofMinutes(1);

    private final RateLimiter rateLimiter = new RateLimiter();

    @Test
    void allowsTheGivenNumberOfAttempts_thenRefuses() {
        assertTrue(rateLimiter.tryConsume("login:1.2.3.4", 3, MINUTE));
        assertTrue(rateLimiter.tryConsume("login:1.2.3.4", 3, MINUTE));
        assertTrue(rateLimiter.tryConsume("login:1.2.3.4", 3, MINUTE));
        assertFalse(rateLimiter.tryConsume("login:1.2.3.4", 3, MINUTE));
    }

    @Test
    void eachKeyIsCountedOnItsOwn() {
        assertTrue(rateLimiter.tryConsume("login:1.2.3.4", 1, MINUTE));
        assertFalse(rateLimiter.tryConsume("login:1.2.3.4", 1, MINUTE));

        assertTrue(rateLimiter.tryConsume("login:5.6.7.8", 1, MINUTE));
        assertTrue(rateLimiter.tryConsume("register:1.2.3.4", 1, MINUTE));
    }

    @Test
    void afterTheWindow_countsFromZeroAgain() throws InterruptedException {
        Duration window = Duration.ofMillis(50);
        assertTrue(rateLimiter.tryConsume("login:1.2.3.4", 1, window));
        assertFalse(rateLimiter.tryConsume("login:1.2.3.4", 1, window));

        Thread.sleep(100);

        assertTrue(rateLimiter.tryConsume("login:1.2.3.4", 1, window));
        assertFalse(rateLimiter.tryConsume("login:1.2.3.4", 1, window));
    }

    @Test
    void refund_givesTheAttemptBack() {
        assertTrue(rateLimiter.tryConsume("register:1.2.3.4", 1, MINUTE));
        rateLimiter.refund("register:1.2.3.4");

        assertTrue(rateLimiter.tryConsume("register:1.2.3.4", 1, MINUTE));
        assertFalse(rateLimiter.tryConsume("register:1.2.3.4", 1, MINUTE));
    }

    @Test
    void refundingMoreThanWasCounted_doesNotAddExtraAttempts() {
        rateLimiter.refund("register:1.2.3.4");
        assertTrue(rateLimiter.tryConsume("register:1.2.3.4", 1, MINUTE));
        rateLimiter.refund("register:1.2.3.4");
        rateLimiter.refund("register:1.2.3.4");

        assertTrue(rateLimiter.tryConsume("register:1.2.3.4", 1, MINUTE));
        assertFalse(rateLimiter.tryConsume("register:1.2.3.4", 1, MINUTE));
    }
}
