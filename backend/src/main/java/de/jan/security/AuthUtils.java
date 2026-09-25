package de.jan.security;

import jakarta.servlet.http.HttpServletRequest;

public class AuthUtils {

    public static String getCurrentEmail(HttpServletRequest request) {
        Object email = request.getAttribute("authenticatedEmail");
        if (email == null) {
            throw new IllegalStateException("No authenticated user found in request. Is this route protected by JwtAuthFilter?");
        }
        return (String) email;
    }
}