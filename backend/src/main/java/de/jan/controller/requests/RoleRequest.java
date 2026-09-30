package de.jan.controller.requests;

import de.jan.role.Permission;

import java.util.List;

public class RoleRequest {

    private String name;
    private List<Permission> permissions;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Permission> getPermissions() { return permissions; }
    public void setPermissions(List<Permission> permissions) { this.permissions = permissions; }
}
