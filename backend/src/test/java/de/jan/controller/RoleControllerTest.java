package de.jan.controller;

import de.jan.role.Permission;
import de.jan.role.Role;
import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RoleControllerTest extends ControllerTest {

    private static final String MISSING_PERMISSION = "Missing permission MANAGE_USERS";
    private static final String LOCKOUT = "You cannot take away your own permission to manage users";

    @Nested
    class ListRoles {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/roles/list"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403() throws Exception {
            mockMvc.perform(get("/api/roles/list")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));
        }

        @Test
        void returnsTheSystemRoleFirstThenTheOthersByName() throws Exception {
            Role admin = inDatastore(() -> roleRepository.ensureAdminRole());
            // the manager's own role is called "role-<number>"
            String manager = bearerWith(Permission.MANAGE_USERS);
            Role cooks = storedRole("Cooks", Permission.MANAGE_RECIPES);

            mockMvc.perform(get("/api/roles/list").header(HttpHeaders.AUTHORIZATION, manager))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(3)))
                    .andExpect(jsonPath("$[0].id").value(admin.getId()))
                    .andExpect(jsonPath("$[0].name").value("ADMIN"))
                    .andExpect(jsonPath("$[0].system").value(true))
                    .andExpect(jsonPath("$[0].permissions", contains("MANAGE_RECIPES", "MANAGE_USERS")))
                    .andExpect(jsonPath("$[1].id").value(cooks.getId()))
                    .andExpect(jsonPath("$[1].name").value("Cooks"))
                    .andExpect(jsonPath("$[1].system").value(false))
                    .andExpect(jsonPath("$[1].permissions", contains("MANAGE_RECIPES")))
                    .andExpect(jsonPath("$[2].name", startsWith("role-")))
                    .andExpect(jsonPath("$[2].permissions", contains("MANAGE_USERS")));
        }
    }

    @Nested
    class CreateRole {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(post("/api/roles/create")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Cooks", "MANAGE_RECIPES")))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndStoresNothing() throws Exception {
            mockMvc.perform(post("/api/roles/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Cooks", "MANAGE_RECIPES")))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            assertTrue(inDatastore(() -> roleRepository.getAll()).stream().noneMatch(role -> role.getName().equals("Cooks")));
        }

        @Test
        void withPermission_returnsTheStoredRole() throws Exception {
            mockMvc.perform(post("/api/roles/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("  Head   Cooks ", "MANAGE_USERS", "MANAGE_RECIPES")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").isNumber())
                    // the name is cleaned up, the permissions come back in a fixed order
                    .andExpect(jsonPath("$.name").value("Head Cooks"))
                    .andExpect(jsonPath("$.permissions", contains("MANAGE_RECIPES", "MANAGE_USERS")))
                    .andExpect(jsonPath("$.system").value(false));
        }

        @Test
        void withoutPermissionsInTheRole_returnsARoleWithoutPermissions() throws Exception {
            mockMvc.perform(post("/api/roles/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Guests")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Guests"))
                    .andExpect(jsonPath("$.permissions", hasSize(0)));
        }

        @Test
        void withEmptyName_returns400() throws Exception {
            mockMvc.perform(post("/api/roles/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body(" ", "MANAGE_RECIPES")))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Role name must not be empty"));
        }

        @Test
        void withTooLongName_returns400() throws Exception {
            mockMvc.perform(post("/api/roles/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("x".repeat(51), "MANAGE_RECIPES")))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Role name must be at most 50 characters long"));
        }

        @Test
        void withNameThatExists_returns400() throws Exception {
            storedRole("Cooks", Permission.MANAGE_RECIPES);

            mockMvc.perform(post("/api/roles/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("COOKS", "MANAGE_RECIPES")))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A role with this name already exists"));
        }

        @Test
        void withUnknownPermission_returns400() throws Exception {
            mockMvc.perform(post("/api/roles/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Cooks", "FLY_TO_THE_MOON")))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class UpdateRole {

        @Test
        void withoutLogin_returns401() throws Exception {
            Role role = storedRole("Cooks", Permission.MANAGE_RECIPES);

            mockMvc.perform(post("/api/roles/update").param("id", role.getId().toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Chefs", "MANAGE_RECIPES")))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndChangesNothing() throws Exception {
            Role role = storedRole("Cooks", Permission.MANAGE_RECIPES);

            mockMvc.perform(post("/api/roles/update").param("id", role.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Chefs", "MANAGE_RECIPES")))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            assertTrue(inDatastore(() -> roleRepository.getById(role.getId())).getName().equals("Cooks"));
        }

        @Test
        void withPermission_returnsTheChangedRole() throws Exception {
            Role role = storedRole("Cooks", Permission.MANAGE_RECIPES);

            mockMvc.perform(post("/api/roles/update").param("id", role.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Chefs", "MANAGE_RECIPES", "MANAGE_USERS")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(role.getId()))
                    .andExpect(jsonPath("$.name").value("Chefs"))
                    .andExpect(jsonPath("$.permissions", contains("MANAGE_RECIPES", "MANAGE_USERS")))
                    .andExpect(jsonPath("$.system").value(false));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/roles/update").param("id", "999")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Chefs", "MANAGE_RECIPES")))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Role 999 not found"));
        }

        @Test
        void withTheSystemRole_returns400() throws Exception {
            Role admin = inDatastore(() -> roleRepository.ensureAdminRole());

            mockMvc.perform(post("/api/roles/update").param("id", admin.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Bosses", "MANAGE_RECIPES")))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The role ADMIN cannot be changed"));
        }

        @Test
        void withNameOfAnotherRole_returns400() throws Exception {
            storedRole("Cooks", Permission.MANAGE_RECIPES);
            Role other = storedRole("Chefs", Permission.MANAGE_RECIPES);

            mockMvc.perform(post("/api/roles/update").param("id", other.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Cooks", "MANAGE_RECIPES")))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A role with this name already exists"));
        }

        @Test
        void takingAwayTheOwnPermissionToManageUsers_returns400() throws Exception {
            User manager = userWith(Permission.MANAGE_USERS);
            Long ownRoleId = manager.getRoleIds().iterator().next();

            mockMvc.perform(post("/api/roles/update").param("id", ownRoleId.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearer(manager))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Managers", "MANAGE_RECIPES")))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(LOCKOUT));
        }

        @Test
        void withoutId_returns400() throws Exception {
            mockMvc.perform(post("/api/roles/update")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Chefs", "MANAGE_RECIPES")))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class DeleteRole {

        @Test
        void withoutLogin_returns401() throws Exception {
            Role role = storedRole("Cooks", Permission.MANAGE_RECIPES);

            mockMvc.perform(post("/api/roles/delete").param("id", role.getId().toString()))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndKeepsTheRole() throws Exception {
            Role role = storedRole("Cooks", Permission.MANAGE_RECIPES);

            mockMvc.perform(post("/api/roles/delete").param("id", role.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            assertTrue(inDatastore(() -> roleRepository.getAll()).stream().anyMatch(r -> r.getId().equals(role.getId())));
        }

        @Test
        void withPermission_returns204AndTakesTheRoleFromItsUsers() throws Exception {
            User cook = userWith(Permission.MANAGE_RECIPES);
            Long roleId = cook.getRoleIds().iterator().next();

            mockMvc.perform(post("/api/roles/delete").param("id", roleId.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            assertTrue(inDatastore(() -> roleRepository.getAll()).stream().noneMatch(r -> r.getId().equals(roleId)));
            assertTrue(inDatastore(() -> userRepository.getByEmail(cook.getEmail())).getRoleIds().isEmpty());
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/roles/delete").param("id", "999")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Role 999 not found"));
        }

        @Test
        void withTheSystemRole_returns400() throws Exception {
            Role admin = inDatastore(() -> roleRepository.ensureAdminRole());

            mockMvc.perform(post("/api/roles/delete").param("id", admin.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The role ADMIN cannot be deleted"));
        }

        @Test
        void deletingTheOwnRoleThatAllowsManagingUsers_returns400() throws Exception {
            User manager = userWith(Permission.MANAGE_USERS);
            Long ownRoleId = manager.getRoleIds().iterator().next();

            mockMvc.perform(post("/api/roles/delete").param("id", ownRoleId.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearer(manager)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(LOCKOUT));
        }
    }

    private String body(String name, String... permissions) throws Exception {
        return json(Map.of("name", name, "permissions", List.of(permissions)));
    }
}
