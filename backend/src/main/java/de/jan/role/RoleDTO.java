package de.jan.role;

import java.util.List;

public class RoleDTO {

    private Long id;
    private String name;
    private List<Permission> permissions;
    private boolean system;

    public static RoleDTO from(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.id = role.getId();
        dto.name = role.getName();
        dto.permissions = List.copyOf(role.getPermissions());
        dto.system = role.isSystem();
        return dto;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public List<Permission> getPermissions() { return permissions; }
    public boolean isSystem() { return system; }
}
