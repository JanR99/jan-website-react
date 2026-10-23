package de.jan.license;

import de.jan.controller.response.LicenseResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LicenseRepositoryTest {

    private static final String THIRD_PARTY = String.join("\n",
            "",
            "Lists of 3 third-party dependencies.",
            "     (Apache License, Version 2.0) Spring Boot (org.springframework.boot:spring-boot:4.1.1 - https://spring.io/projects/spring-boot)",
            "     (Eclipse Distribution License - v 1.0) (Eclipse Public License - v 2.0) Jakarta Annotations API (jakarta.annotation:jakarta.annotation-api:3.0.0 - https://projects.eclipse.org/projects/ee4j.ca)",
            "     (The MIT License) checker-qual (org.checkerframework:checker-qual:3.42.0 - no url defined)");

    @Test
    void parse_readsEveryLibraryWithItsLicenses_byName() {
        assertEquals(List.of(
                new LicenseResponse("checker-qual", "org.checkerframework:checker-qual", "3.42.0",
                        List.of("The MIT License"), null),
                new LicenseResponse("Jakarta Annotations API", "jakarta.annotation:jakarta.annotation-api", "3.0.0",
                        List.of("Eclipse Distribution License - v 1.0", "Eclipse Public License - v 2.0"),
                        "https://projects.eclipse.org/projects/ee4j.ca"),
                new LicenseResponse("Spring Boot", "org.springframework.boot:spring-boot", "4.1.1",
                        List.of("Apache License, Version 2.0"), "https://spring.io/projects/spring-boot")
        ), LicenseRepository.parse(THIRD_PARTY));
    }

    @Test
    void parse_withoutLibraries_isEmpty() {
        assertEquals(List.of(), LicenseRepository.parse("The project has no dependencies."));
    }
}
