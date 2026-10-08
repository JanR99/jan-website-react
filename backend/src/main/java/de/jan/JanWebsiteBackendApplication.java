package de.jan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Map;

@SpringBootApplication
public class JanWebsiteBackendApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(JanWebsiteBackendApplication.class);
        // Cloud Run always sets K_SERVICE: the Swagger UI is only there for local development.
        if (System.getenv("K_SERVICE") != null) {
            app.setDefaultProperties(Map.of("springdoc.swagger-ui.enabled", "false"));
        }
        app.run(args);
    }
}