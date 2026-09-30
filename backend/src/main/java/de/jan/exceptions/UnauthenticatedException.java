package de.jan.exceptions;

public class UnauthenticatedException extends RuntimeException {
    public UnauthenticatedException() {
        super("You need to be logged in to use this method");
    }
}
