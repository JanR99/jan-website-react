package de.jan.controller.requests;

public class LoginRequest {
    private String email;
    private String password;
    /** "Angemeldet bleiben": the login then lasts 30 days instead of 2 hours */
    private boolean rememberMe;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public boolean isRememberMe() { return rememberMe; }
    public void setRememberMe(boolean rememberMe) { this.rememberMe = rememberMe; }
}
