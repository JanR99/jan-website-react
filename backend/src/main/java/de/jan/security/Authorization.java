package de.jan.security;

import de.jan.exceptions.UnauthenticatedException;
import de.jan.exceptions.UnauthorizedException;
import de.jan.role.Permission;
import de.jan.role.Role;
import de.jan.role.RoleDAO;
import de.jan.user.User;

import java.util.EnumSet;
import java.util.Set;

/**
 * Checks what the logged-in user may do, based on the permissions of their roles.
 * Usage: Authorization.with(user).require(Permission.MANAGE_RECIPES);
 */
public class Authorization {

    public static final String USER_NOT_AUTHORIZED = "User is not authorized";

    private final User user;
    private final Set<Permission> permissions;

    private Authorization(User user) {
        if (user == null) {
            throw new UnauthenticatedException();
        }
        this.user = user;
        this.permissions = permissionsOf(user);
    }

    public static Authorization with(User user) {
        return new Authorization(user);
    }

    /** Union of the permissions of all roles of the user. */
    public static Set<Permission> permissionsOf(User user) {
        Set<Permission> result = EnumSet.noneOf(Permission.class);
        for (Role role : new RoleDAO().getByIds(user.getRoleIds())) {
            result.addAll(role.getPermissions());
        }
        return result;
    }

    public boolean has(Permission permission) {
        return permissions.contains(permission);
    }

    public void require(Permission permission) {
        if (!has(permission)) {
            throw new UnauthorizedException("Missing permission " + permission);
        }
    }

    /** The user acts on their own data, or may manage users. */
    public void of(User other) {
        if (!user.getEmail().equals(other.getEmail()) && !has(Permission.MANAGE_USERS)) {
            throw new UnauthorizedException(USER_NOT_AUTHORIZED);
        }
    }
}
