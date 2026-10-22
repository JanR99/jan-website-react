package de.jan.controller.requests;

public record ChangePasswordRequest(String currentPassword, String newPassword) {
}
