package de.jan.user;

import java.util.Set;

/** A user as seen in the user management, including their roles (not sent on login). */
public record UserAdminDTO(Long id, String email, String firstname, String lastname, Set<Long> roleIds) {

    public static UserAdminDTO from(User user) {
        return new UserAdminDTO(user.getId(), user.getEmail(), user.getFirstname(), user.getLastname(),
                Set.copyOf(user.getRoleIds()));
    }
}
