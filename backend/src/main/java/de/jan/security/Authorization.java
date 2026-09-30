package de.jan.security;

import de.jan.exceptions.AdminException;
import de.jan.exceptions.UnauthenticatedException;
import de.jan.exceptions.UnauthorizedException;
import de.jan.user.User;

public class Authorization {

    public static final String USER_NOT_AUTHORIZED = "User is not authorized";

    private final User user;
    private final boolean isAdmin;

    private Authorization(User user) {
        if (user == null) {
            throw new UnauthenticatedException();
        }
        this.user = user;
        this.isAdmin = user.isAdmin();
    }

    public static Authorization with(User user) {
        return new Authorization(user);
    }

    private AuthorizationResult result(boolean isAuthorized) {
        return new AuthorizationResult(isAdmin).or(new AuthorizationResult(isAuthorized));
    }

    public void isAdmin() {
        new AuthorizationResult(isAdmin, new AdminException()).check();
    }

    public void of(User user) {
        result(this.user.getEmail().equals(user.getEmail())).check();
    }

    static class AuthorizationResult {

        private final boolean isAuthorized;
        private final RuntimeException exception;

        public AuthorizationResult(boolean isAuthorized) {
            this(isAuthorized, USER_NOT_AUTHORIZED);
        }

        public AuthorizationResult(boolean isAuthorized, String exceptionMessage) {
            this(isAuthorized, new UnauthorizedException(exceptionMessage));
        }

        public AuthorizationResult(boolean isAuthorized, RuntimeException exception) {
            this.isAuthorized = isAuthorized;
            this.exception = exception;
        }

        public AuthorizationResult or(AuthorizationResult other) {
            boolean combined = this.isAuthorized || other.isAuthorized;
            RuntimeException combinedException = other.exception != null ? other.exception : this.exception;
            return new AuthorizationResult(combined, combinedException);
        }

        public void check() {
            if (!isAuthorized) {
                throw exception;
            }
        }
    }
}
