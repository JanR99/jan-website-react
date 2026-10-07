package de.jan.controller;

import de.jan.controller.requests.ChangePasswordRequest;
import de.jan.controller.requests.DeleteAccountRequest;
import de.jan.controller.requests.LoginRequest;
import de.jan.controller.requests.PasswordResetRequest;
import de.jan.controller.requests.RegisterRequest;
import de.jan.controller.requests.ResetPasswordRequest;
import de.jan.controller.requests.SetRolesRequest;
import de.jan.controller.requests.UpdateProfileRequest;
import de.jan.controller.response.LoginResponse;
import de.jan.role.Permission;
import de.jan.security.Authorization;
import de.jan.security.CurrentUser;
import de.jan.security.JwtService;
import de.jan.user.User;
import de.jan.user.UserAdminDTO;
import de.jan.user.UserDTO;
import de.jan.user.repository.PasswordResetRepository;
import de.jan.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "user")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordResetRepository passwordResetRepository;

    private static final String REGISTER = "register";
    private static final String LOGIN = "login";
    private static final String RENEW_TOKEN = "renewToken";
    private static final String GET_USER_BY_EMAIL = "getUserByEmail";
    private static final String SET_ROLES = "setRoles";
    private static final String REQUEST_PASSWORD_RESET = "requestPasswordReset";
    private static final String RESET_PASSWORD = "resetPassword";
    private static final String UPDATE_PROFILE = "updateProfile";
    private static final String CHANGE_PASSWORD = "changePassword";
    private static final String DELETE_ACCOUNT = "deleteAccount";
    private static final String GET_PERMISSIONS = "getPermissions";
    private static final String LIST_USERS = "listUsers";

    public UserController(UserRepository userRepository, JwtService jwtService, PasswordResetRepository passwordResetRepository) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordResetRepository = passwordResetRepository;
    }

    @Operation(operationId = REGISTER)
    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(
            @RequestBody RegisterRequest request
    ) {
        User savedUser = userRepository.register(request);
        return ResponseEntity.ok(UserDTO.from(savedUser));
    }

    @Operation(operationId = LOGIN)
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ) {
        User user = userRepository.login(request);
        String token = jwtService.generateToken(user, request.isRememberMe());
        return ResponseEntity.ok(new LoginResponse(token, UserDTO.from(user)));
    }

    @Operation(operationId = RENEW_TOKEN)
    @PostMapping("/renewToken")
    public ResponseEntity<LoginResponse> renewToken(
            @CurrentUser User user,
            // hidden: the frontend sends this header with every request anyway, it is not a parameter of its own
            @Parameter(hidden = true) @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization
    ) {
        String token = jwtService.renewToken(user, authorization.substring(JwtService.BEARER_PREFIX.length()));
        return ResponseEntity.ok(new LoginResponse(token, UserDTO.from(user)));
    }

    @Operation(operationId = REQUEST_PASSWORD_RESET)
    @PostMapping("/requestPasswordReset")
    public ResponseEntity<Void> requestPasswordReset(
            @RequestBody PasswordResetRequest request
    ) {
        passwordResetRepository.requestReset(request.getEmail());
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = RESET_PASSWORD)
    @PostMapping("/resetPassword")
    public ResponseEntity<Void> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) {
        passwordResetRepository.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = UPDATE_PROFILE)
    @PostMapping("/updateProfile")
    public ResponseEntity<UserDTO> updateProfile(
            @CurrentUser User user,
            @RequestBody UpdateProfileRequest body
    ) {
        User updatedUser = userRepository.updateName(user, body.getFirstname(), body.getLastname());
        return ResponseEntity.ok(UserDTO.from(updatedUser));
    }

    @Operation(operationId = CHANGE_PASSWORD)
    @PostMapping("/changePassword")
    public ResponseEntity<LoginResponse> changePassword(
            @CurrentUser User user,
            // hidden: the frontend sends this header with every request anyway, it is not a parameter of its own
            @Parameter(hidden = true) @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @RequestBody ChangePasswordRequest body
    ) {
        User updatedUser = userRepository.changeOwnPassword(user, body.getCurrentPassword(), body.getNewPassword());
        // the change logs the account out everywhere; with a new token this device stays logged in
        String token = jwtService.reissueToken(updatedUser, authorization.substring(JwtService.BEARER_PREFIX.length()));
        return ResponseEntity.ok(new LoginResponse(token, UserDTO.from(updatedUser)));
    }

    @Operation(operationId = DELETE_ACCOUNT)
    @PostMapping("/deleteAccount")
    public ResponseEntity<Void> deleteAccount(
            @CurrentUser User user,
            @RequestBody DeleteAccountRequest body
    ) {
        userRepository.deleteAccount(user, body.getPassword());
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = GET_PERMISSIONS)
    @GetMapping("/permissions")
    public ResponseEntity<List<Permission>> getPermissions(
            @CurrentUser User user
    ) {
        return ResponseEntity.ok(List.copyOf(Authorization.permissionsOf(user)));
    }

    @Operation(operationId = GET_USER_BY_EMAIL)
    @GetMapping("/getUserByEmail")
    public ResponseEntity<UserDTO> getUserByEmail(
            @CurrentUser User caller,
            @RequestParam("email") String email
    ) {
        Authorization.with(caller).require(Permission.MANAGE_USERS);
        User user = userRepository.getByEmail(email);
        return user == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(UserDTO.from(user));
    }

    @Operation(operationId = LIST_USERS)
    @GetMapping("/list")
    public ResponseEntity<List<UserAdminDTO>> listUsers(
            @CurrentUser User caller
    ) {
        Authorization.with(caller).require(Permission.MANAGE_USERS);
        return ResponseEntity.ok(userRepository.getAll().stream().map(UserAdminDTO::from).toList());
    }

    @Operation(operationId = SET_ROLES)
    @PostMapping("/setRoles")
    public ResponseEntity<UserAdminDTO> setRoles(
            @CurrentUser User caller,
            @RequestBody SetRolesRequest body
    ) {
        Authorization.with(caller).require(Permission.MANAGE_USERS);
        return ResponseEntity.ok(UserAdminDTO.from(userRepository.setRoles(caller, body.getEmail(), body.getRoleIds())));
    }
}
