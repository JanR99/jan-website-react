package de.jan.controller;

import de.jan.controller.requests.LoginRequest;
import de.jan.controller.requests.RegisterRequest;
import de.jan.controller.requests.SetAdminStatusRequest;
import de.jan.controller.response.LoginResponse;
import de.jan.security.AuthUtils;
import de.jan.security.Authorization;
import de.jan.security.JwtService;
import de.jan.user.User;
import de.jan.user.UserDTO;
import de.jan.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "user")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private static final String REGISTER = "register";
    private static final String LOGIN = "login";
    private static final String GET_USER_BY_EMAIL = "getUserByEmail";
    private static final String SET_ADMIN_STATUS = "setAdminStatus";

    public UserController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
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
        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(new LoginResponse(token, UserDTO.from(user)));
    }

    @Operation(operationId = GET_USER_BY_EMAIL)
    @GetMapping("getUserByEmail")
    public ResponseEntity<UserDTO> getUserByEmail(
            @RequestParam("email") String email
    ) {
        User user = userRepository.getByEmail(email);
        return ResponseEntity.ok(UserDTO.from(user));
    }

    @Operation(operationId = SET_ADMIN_STATUS)
    @PostMapping("/setAdminStatus")
    public ResponseEntity<UserDTO> setAdminStatus(
            HttpServletRequest request,
            @RequestBody SetAdminStatusRequest body
    ) {
        String callerEmail = AuthUtils.getCurrentEmail(request);
        Authorization.isAdmin(userRepository.getByEmail(callerEmail));
        User updatedUser = userRepository.setAdminStatus(body.getTargetEmail(), body.isAdmin());
        return ResponseEntity.ok(UserDTO.from(updatedUser));
    }
}