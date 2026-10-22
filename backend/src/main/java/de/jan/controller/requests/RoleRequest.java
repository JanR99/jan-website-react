package de.jan.controller.requests;

import de.jan.role.Permission;

import java.util.List;

public record RoleRequest(String name, List<Permission> permissions) {
}
