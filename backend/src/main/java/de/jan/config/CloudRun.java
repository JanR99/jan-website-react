package de.jan.config;

import org.springframework.stereotype.Component;

/**
 * Whether the backend runs on Cloud Run, which always sets K_SERVICE. The only place that reads K_SERVICE.
 * A bean, so tests can switch it; {@link #detect()} for code that runs before Spring.
 */
@Component
public class CloudRun {

    public static boolean detect() {
        return System.getenv("K_SERVICE") != null;
    }

    public boolean isActive() {
        return detect();
    }
}
