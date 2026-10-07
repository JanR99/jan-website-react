package de.jan.security;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimiter {

    private static class Window {
        final AtomicInteger count = new AtomicInteger(0);
        volatile Instant windowStart = Instant.now();
    }

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    /**
     * Records an attempt for the given key (e.g. name of the limit plus client IP) and returns
     * whether it is still within the allowed number of attempts for the current window.
     */
    public boolean tryConsume(String key, int maxAttempts, Duration windowLength) {
        Window window = windows.computeIfAbsent(key, k -> new Window());

        synchronized (window) {
            if (Duration.between(window.windowStart, Instant.now()).compareTo(windowLength) > 0) {
                window.windowStart = Instant.now();
                window.count.set(0);
            }
            return window.count.incrementAndGet() <= maxAttempts;
        }
    }

    /** Takes back an attempt that tryConsume allowed, for limits that only count successful requests. */
    public void refund(String key) {
        Window window = windows.get(key);
        if (window == null) {
            return;
        }

        synchronized (window) {
            if (window.count.get() > 0) {
                window.count.decrementAndGet();
            }
        }
    }
}