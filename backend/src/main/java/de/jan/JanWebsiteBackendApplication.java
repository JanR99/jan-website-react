package de.jan;

import de.jan.config.CloudRun;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Map;

@SpringBootApplication
public class JanWebsiteBackendApplication {

    static void main(String[] args) {
        SpringApplication app = new SpringApplication(JanWebsiteBackendApplication.class);
        // the Swagger UI is only there for local development
        if (CloudRun.detect()) {
            app.setDefaultProperties(Map.of("springdoc.swagger-ui.enabled", "false"));
        }
        app.run(args);
    }
}