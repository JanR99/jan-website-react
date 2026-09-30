package de.jan.role.repository;

import de.jan.controller.requests.RoleRequest;
import de.jan.exceptions.EntityNotFoundException;
import de.jan.exceptions.EntityStateException;
import de.jan.role.Permission;
import de.jan.role.Role;
import de.jan.role.RoleDAO;
import de.jan.user.User;
import de.jan.user.UserDAO;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Component
public class RoleRepository {

    private static final int NAME_MAX_LENGTH = 50;
    private static final String LOCKOUT_MESSAGE = "You cannot take away your own permission to manage users";

    private final RoleDAO roleDAO;
    private final UserDAO userDAO;

    public RoleRepository() {
        this.roleDAO = new RoleDAO();
        this.userDAO = new UserDAO();
    }

    /** All roles, the system role first, then by name. */
    public List<Role> getAll() {
        return roleDAO.getAll().stream()
                .sorted(Comparator.comparing((Role role) -> !role.isSystem())
                        .thenComparing(Role::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
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

    public Role create(RoleRequest request) {
        Role role = new Role(validateName(request.getName(), null), validatePermissions(request.getPermissions()), false);
        return roleDAO.save(role);
    }

    public Role update(User caller, Long id, RoleRequest request) {
        Role role = getById(id);
        if (role.isSystem()) {
            throw new EntityStateException("The role " + role.getName() + " cannot be changed");
        }
        List<Permission> permissions = validatePermissions(request.getPermissions());
        String name = validateName(request.getName(), id);

        // would the caller lose MANAGE_USERS through this change?
        if (caller.getRoleIds().contains(id)) {
            Set<Permission> after = permissionsOf(without(caller.getRoleIds(), id));
            after.addAll(permissions);
            if (!after.contains(Permission.MANAGE_USERS)) {
                throw new EntityStateException(LOCKOUT_MESSAGE);
            }
        }

        role.setName(name);
        role.setPermissions(permissions);
        return roleDAO.save(role);
    }

    /** Deletes the role and removes it from every user. */
    public void delete(User caller, Long id) {
        Role role = getById(id);
        if (role.isSystem()) {
            throw new EntityStateException("The role " + role.getName() + " cannot be deleted");
        }
        if (caller.getRoleIds().contains(id)
                && !permissionsOf(without(caller.getRoleIds(), id)).contains(Permission.MANAGE_USERS)) {
            throw new EntityStateException(LOCKOUT_MESSAGE);
        }

        List<User> users = userDAO.getByRoleId(id);
        for (User user : users) {
            user.getRoleIds().remove(id);
        }
        if (!users.isEmpty()) {
            userDAO.saveAll(users);
        }
        roleDAO.delete(role);
    }

    /** Checks that all ids exist (null entries are dropped). */
    public Set<Long> validateRoleIds(Set<Long> roleIds) {
        Set<Long> ids = new LinkedHashSet<>();
        if (roleIds != null) {
            roleIds.stream().filter(Objects::nonNull).forEach(ids::add);
        }
        if (roleDAO.getByIds(ids).size() != ids.size()) {
            throw new EntityStateException("Unknown role");
        }
        return ids;
    }

    private String validateName(String name, Long ownId) {
        String trimmed = name == null ? "" : name.trim().replaceAll("\\s+", " ");
        if (trimmed.isEmpty()) {
            throw new EntityStateException("Role name must not be empty");
        }
        if (trimmed.length() > NAME_MAX_LENGTH) {
            throw new EntityStateException("Role name must be at most " + NAME_MAX_LENGTH + " characters long");
        }
        boolean taken = roleDAO.getAll().stream()
                .anyMatch(other -> !Objects.equals(other.getId(), ownId) && other.getName().equalsIgnoreCase(trimmed));
        if (taken) {
            throw new EntityStateException("A role with this name already exists");
        }
        return trimmed;
    }

    private static List<Permission> validatePermissions(Collection<Permission> permissions) {
        // unknown names are already rejected by Jackson; keep the enum order
        Set<Permission> set = EnumSet.noneOf(Permission.class);
        if (permissions != null) {
            permissions.stream().filter(Objects::nonNull).forEach(set::add);
        }
        return new ArrayList<>(set);
    }

    private static Set<Long> without(Set<Long> ids, Long removed) {
        Set<Long> rest = new LinkedHashSet<>(ids);
        rest.remove(removed);
        return rest;
    }
}
