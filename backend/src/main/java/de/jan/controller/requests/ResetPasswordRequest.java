package de.jan.controller.requests;

public record ResetPasswordRequest(String token, String password) {
}
