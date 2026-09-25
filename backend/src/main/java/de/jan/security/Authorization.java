package de.jan.security;

import de.jan.exceptions.AdminException;
import de.jan.user.User;

public class Authorization {

    public static void isAdmin(User caller) {
        if (!caller.isAdmin()) {
            throw new AdminException();
        }
    }
}
