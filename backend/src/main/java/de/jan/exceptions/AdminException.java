package de.jan.exceptions;

public class AdminException extends UnauthorizedException {
    public AdminException() {
        super("Only admins can enter this method");
    }
}
