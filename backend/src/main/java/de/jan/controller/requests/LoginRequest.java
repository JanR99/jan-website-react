package de.jan.controller.requests;

/** @param rememberMe "Angemeldet bleiben": the login then lasts 30 days instead of 2 hours; missing counts as false */
public record LoginRequest(String email, String password, Boolean rememberMe) {
}
