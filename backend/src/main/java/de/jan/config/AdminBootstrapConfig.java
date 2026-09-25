package de.jan.config;

import de.jan.controller.requests.RegisterRequest;
import de.jan.exceptions.EntityNotFoundException;
import de.jan.user.User;
import de.jan.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    public CommandLineRunner bootstrapAdmin(UserRepository userRepository) {
        return args -> {
            String email = System.getenv("BOOTSTRAP_ADMIN_EMAIL");
            String password = System.getenv("BOOTSTRAP_ADMIN_PASSWORD");

            if (email == null || email.isBlank()) {
                System.out.println("Bootstrap: BOOTSTRAP_ADMIN_EMAIL not set, skipping admin bootstrap.");
                return;
            }

            try {
                // If User exists, set admin status
                userRepository.setAdminStatus(email, true);
                System.out.println("Bootstrap: " + email + " is now admin (existing user).");
            } catch (EntityNotFoundException e) {
                // create User if it does not exist yet
                if (password == null || password.isBlank()) {
                    System.out.println("Bootstrap: user " + email + " does not exist and BOOTSTRAP_ADMIN_PASSWORD is not set. Skipping.");
                    return;
                }

                RegisterRequest request = new RegisterRequest();
                request.setEmail(email);
                request.setPassword(password);
                request.setFirstname("Website");
                request.setLastname("Admin");

                try {
                    User newUser = userRepository.register(request);
                    userRepository.setAdminStatus(newUser.getEmail(), true);
                    System.out.println("Bootstrap: " + email + " was newly created and is now admin.");
                } catch (Exception inner) {
                    System.out.println("Bootstrap-Admin couldn't be created: " + inner.getMessage());
                }
            }
        };
    }
}