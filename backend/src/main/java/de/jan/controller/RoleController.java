package de.jan.controller;

import de.jan.controller.requests.RoleRequest;
import de.jan.role.Permission;
import de.jan.role.RoleDTO;
import de.jan.role.repository.RoleRepository;
import de.jan.security.Authorization;
import de.jan.security.CurrentUser;
import de.jan.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Roles and their permissions. Everything here requires MANAGE_USERS.
 */
@Tag(name = "roles")
@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleRepository roleRepository;

    private static final String LIST_ROLES = "listRoles";
    private static final String CREATE_ROLE = "createRole";
    private static final String UPDATE_ROLE = "updateRole";
    private static final String DELETE_ROLE = "deleteRole";

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Operation(operationId = LIST_ROLES)
    @GetMapping("/list")
    public ResponseEntity<List<RoleDTO>> listRoles(
            @CurrentUser User user
    ) {
        Authorization.with(user).require(Permission.MANAGE_USERS);
        return ResponseEntity.ok(roleRepository.getAll().stream().map(RoleDTO::from).toList());
    }

    @Operation(operationId = CREATE_ROLE)
    @PostMapping("/create")
    public ResponseEntity<RoleDTO> createRole(
            @CurrentUser User user,
            @RequestBody RoleRequest body
    ) {
        Authorization.with(user).require(Permission.MANAGE_USERS);
        return ResponseEntity.ok(RoleDTO.from(roleRepository.create(body)));
    }

    @Operation(operationId = UPDATE_ROLE)
    @PostMapping("/update")
    public ResponseEntity<RoleDTO> updateRole(
            @CurrentUser User user,
            @RequestParam("id") Long id,
            @RequestBody RoleRequest body
    ) {
        Authorization.with(user).require(Permission.MANAGE_USERS);
        return ResponseEntity.ok(RoleDTO.from(roleRepository.update(user, id, body)));
    }

    @Operation(operationId = DELETE_ROLE)
    @PostMapping("/delete")
    public ResponseEntity<Void> deleteRole(
            @CurrentUser User user,
            @RequestParam("id") Long id
    ) {
        Authorization.with(user).require(Permission.MANAGE_USERS);
        roleRepository.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
