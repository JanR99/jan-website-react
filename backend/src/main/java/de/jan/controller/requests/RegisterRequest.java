package de.jan.controller.requests;

public record RegisterRequest(String email, String password, String firstname, String lastname) {
}
