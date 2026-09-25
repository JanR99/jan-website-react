package de.jan.config;

import com.googlecode.objectify.ObjectifyService;
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

            // executes outside any HTTP request, so no Objectify context
            ObjectifyService.run(() -> {
                try {
                    userRepository.setAdminStatus(email, true);
                    System.out.println("Bootstrap: " + email + " is now admin (existing user).");
                } catch (EntityNotFoundException e) {
                    if (password == null || password.isBlank()) {
                        System.out.println("Bootstrap: user " + email + " does not exist and BOOTSTRAP_ADMIN_PASSWORD is not set. Skipping.");
                        return null;
                    }

                    RegisterRequest request = new RegisterRequest();
                    request.setEmail(email);
                    request.setPassword(password);
                    request.setFirstname("Admin");
                    request.setLastname("");

                    try {
                        User newUser = userRepository.register(request);
                        userRepository.setAdminStatus(newUser.getEmail(), true);
                        System.out.println("Bootstrap: " + email + " was newly created and is now admin.");
                    } catch (Exception inner) {
                        System.out.println("Bootstrap-Admin couldn't be created: " + inner.getMessage());
                    }
                } catch (Exception e) {
                    System.out.println("Bootstrap-Admin couldn't set admin status: " + e.getMessage());
                }
                return null;
            });
        };
    }
}