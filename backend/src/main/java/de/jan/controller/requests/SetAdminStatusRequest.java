package de.jan.controller.requests;

public class SetAdminStatusRequest {
    private String targetEmail;
    private boolean admin;

    public String getTargetEmail() { return targetEmail; }
    public void setTargetEmail(String targetEmail) { this.targetEmail = targetEmail; }
    public boolean isAdmin() { return admin; }
    public void setAdmin(boolean admin) { this.admin = admin; }
}
