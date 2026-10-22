package de.jan.role;

import java.util.List;

public record RoleDTO(Long id, String name, List<Permission> permissions, boolean system) {

    public static RoleDTO from(Role role) {
        return new RoleDTO(role.getId(), role.getName(), List.copyOf(role.getPermissions()), role.isSystem());
    }
}
