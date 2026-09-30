package de.jan.security;

import de.jan.exceptions.AdminException;
import de.jan.exceptions.UnauthorizedException;
import de.jan.user.User;

public class Authorization {

    /**
     * The caller must be an existing user. A valid token whose account no longer exists is rejected.
     */
    public static void isLoggedIn(User caller) {
        if (caller == null) {
            throw new UnauthorizedException("You need to be logged in to use this method");
        }
    }

    public static void isAdmin(User caller) {
        if (!caller.isAdmin()) {
            throw new AdminException();
        }
    }
}
