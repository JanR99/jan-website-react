package de.jan.controller.response;

import java.util.List;

/**
 * A library the backend is built with, and its licenses.
 *
 * @param name     like "Spring Boot"
 * @param artifact Maven group and artifact, like "org.springframework.boot:spring-boot"
 * @param url      the project's website, null if it names none
 */
public record LicenseResponse(String name, String artifact, String version, List<String> licenses, String url) {
}
