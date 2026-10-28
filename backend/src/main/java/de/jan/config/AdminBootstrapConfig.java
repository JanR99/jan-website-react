package de.jan.config;

import com.googlecode.objectify.ObjectifyService;
import de.jan.controller.requests.RegisterRequest;
import de.jan.user.User;
import de.jan.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminBootstrapConfig {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapConfig.class);

    /** email and password come from the environment variables BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD */
    @Bean
    public CommandLineRunner bootstrapAdmin(
            UserRepository userRepository,
            @Value("${BOOTSTRAP_ADMIN_EMAIL:}") String email,
            @Value("${BOOTSTRAP_ADMIN_PASSWORD:}") String password
    ) {
        return _ -> {
            if (email == null || email.isBlank()) {
                log.info("Bootstrap: BOOTSTRAP_ADMIN_EMAIL not set, skipping admin bootstrap.");
                return;
            }

            // executes outside any HTTP request, so no Objectify context
            ObjectifyService.run(() -> {
                try {
                    User existing = userRepository.getByEmail(email);
                    if (existing != null) {
                        userRepository.grantAdminRole(existing);
                        log.info("Bootstrap: {} is now admin (existing user).", email);
                        return null;
                    }

                    if (password == null || password.isBlank()) {
                        log.warn("Bootstrap: user {} does not exist and BOOTSTRAP_ADMIN_PASSWORD is not set. Skipping.", email);
                        return null;
                    }

                    RegisterRequest request = new RegisterRequest(email, password, "Admin", "Admin");

                    try {
                        User newUser = userRepository.register(request);
                        userRepository.grantAdminRole(newUser);
                        log.info("Bootstrap: {} was newly created and is now admin.", email);
                    } catch (Exception inner) {
                        log.error("Bootstrap-Admin couldn't be created: {}", inner.getMessage());
                    }
                } catch (Exception e) {
                    log.error("Bootstrap-Admin couldn't set admin status: {}", e.getMessage());
                }
                return null;
            });
        };
    }
}