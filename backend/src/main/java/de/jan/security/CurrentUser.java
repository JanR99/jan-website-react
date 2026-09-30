package de.jan.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Injects the logged-in {@link de.jan.user.User} into a controller method parameter.
 * Every endpoint with such a parameter requires a valid JWT and an existing account;
 * otherwise the request is answered with 401 before the method runs.
 * The user is resolved by {@link CurrentUserArgumentResolver}.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
