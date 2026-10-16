package de.jan.role.repository;

import de.jan.role.Permission;
import de.jan.role.Role;
import de.jan.role.RoleDAO;
import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RoleRepositoryTest extends ControllerTest {

    @Test
    void permissionsOfAUser_areThoseOfAllTheirRoles() {
        User user = userWith(Permission.MANAGE_RECIPES);
        Role second = storedRole("backup", Permission.EXPORT_DATA);
        user.getRoleIds().add(second.getId());

        Set<Permission> permissions = inDatastore(() -> roleRepository.permissionsOf(user));

        assertEquals(EnumSet.of(Permission.MANAGE_RECIPES, Permission.EXPORT_DATA), permissions);
    }

    @Test
    void adminRoleWithMissingPermissions_getsAllOfThem() {
        // as if a permission had been added to the enum after the role was stored
        inDatastore(() -> new RoleDAO().save(new Role(Role.ADMIN, new ArrayList<>(List.of(Permission.MANAGE_RECIPES)), true)));

        Role admin = inDatastore(() -> roleRepository.ensureAdminRole());

        assertEquals(EnumSet.allOf(Permission.class), EnumSet.copyOf(admin.getPermissions()));
        assertEquals(EnumSet.allOf(Permission.class),
                EnumSet.copyOf(inDatastore(() -> roleRepository.getById(admin.getId())).getPermissions()));
    }
}
