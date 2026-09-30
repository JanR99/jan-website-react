package de.jan.role.repository;

import de.jan.exceptions.EntityNotFoundException;
import de.jan.role.Permission;
import de.jan.role.Role;
import de.jan.role.RoleDAO;
import de.jan.user.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
public class RoleRepository {


    private final RoleDAO roleDAO;

    public RoleRepository() {
        this.roleDAO = new RoleDAO();
    }

    public Role getById(Long id) {
        Role role = id == null ? null : roleDAO.getById(id);
        if (role == null) {
            throw new EntityNotFoundException("Role " + id + " not found");
        }
        return role;
    }

    /** Union of the permissions of all roles with these ids. */
    public Set<Permission> permissionsOf(Collection<Long> roleIds) {
        Set<Permission> permissions = EnumSet.noneOf(Permission.class);
        for (Role role : roleDAO.getByIds(roleIds)) {
            permissions.addAll(role.getPermissions());
        }
        return permissions;
    }

    public Set<Permission> permissionsOf(User user) {
        return permissionsOf(user.getRoleIds());
    }

    /** The ADMIN role, created if missing; it always has every permission. */
    public Role ensureAdminRole() {
        List<Permission> all = List.of(Permission.values());
        Role admin = roleDAO.getByName(Role.ADMIN).stream().findFirst().orElse(null);
        if (admin == null) {
            return roleDAO.save(new Role(Role.ADMIN, new ArrayList<>(all), true));
        }
        // new permissions added to the enum are granted to ADMIN automatically
        if (!new LinkedHashSet<>(admin.getPermissions()).containsAll(all)) {
            admin.setPermissions(new ArrayList<>(all));
            roleDAO.save(admin);
        }
        return admin;
    }

    public boolean hasAdminRole(User user) {
        return roleDAO.getByIds(user.getRoleIds()).stream().anyMatch(Role::isSystem);
    }
}
