package de.jan.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Enumeration;
import java.util.Map;

public class LoginRateLimitFilter extends OncePerRequestFilter {

    /**
     * Every limit is counted on its own, per client IP.
     * onlySuccessful: a request the backend rejects (e.g. a password that is too short) is not counted.
     */
    private record Limit(String name, int maxAttempts, Duration window, boolean onlySuccessful, String message) {
    }

    // against guessing passwords and reset tokens; login, password reset and password change share these attempts
    private static final Limit LOGIN = new Limit("login", 5, Duration.ofMinutes(1), false,
            "Too many attempts, please try again in a minute.");

    // every registration creates an account and sends a mail to the admin
    private static final Limit REGISTRATION = new Limit("registration", 3, Duration.ofHours(1), true,
            "Too many registrations, please try again later.");

    private static final Map<String, Limit> LIMITS = Map.of(
            "/api/users/login", LOGIN,
            "/api/users/requestPasswordReset", LOGIN,
            "/api/users/resetPassword", LOGIN,
            "/api/users/changePassword", LOGIN,
            "/api/users/register", REGISTRATION
    );

    private final RateLimiter rateLimiter;

    public LoginRateLimitFilter(RateLimiter rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    /** The paths this filter has to be registered for. */
    public static String[] limitedPaths() {
        return LIMITS.keySet().toArray(new String[0]);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !LIMITS.containsKey(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        Limit limit = LIMITS.get(request.getRequestURI());
        String key = limit.name() + ":" + extractClientIp(request);

        if (!rateLimiter.tryConsume(key, limit.maxAttempts(), limit.window())) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"" + limit.message() + "\"}");
            return;
        }

        boolean successful = false;
        try {
            filterChain.doFilter(request, response);
            successful = response.getStatus() < 400;
        } finally {
            if (limit.onlySuccessful() && !successful) {
                rateLimiter.refund(key);
            }
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String lastEntry = null;
        Enumeration<String> headers = request.getHeaders("X-Forwarded-For");
        while (headers != null && headers.hasMoreElements()) {
            for (String entry : headers.nextElement().split(",")) {
                if (!entry.isBlank()) {
                    lastEntry = entry.trim();
                }
            }
        }
        return lastEntry != null ? lastEntry : request.getRemoteAddr();
    }
}