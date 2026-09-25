package de.jan.controller;

import de.jan.controller.requests.LoginRequest;
import de.jan.controller.requests.RegisterRequest;
import de.jan.controller.response.LoginResponse;
import de.jan.security.JwtService;
import de.jan.user.User;
import de.jan.user.UserDTO;
import de.jan.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public UserController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(
            @RequestBody RegisterRequest request
    ) {
        User savedUser = userRepository.register(request);
        return ResponseEntity.ok(UserDTO.from(savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ) {
        User user = userRepository.login(request);
        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(new LoginResponse(token, UserDTO.from(user)));
    }

    @GetMapping("getUserByEmail")
    public ResponseEntity<UserDTO> getUserByEmail(
            @RequestParam("email") String email
    ) {
        User user = userRepository.getByEmail(email);
        return ResponseEntity.ok(UserDTO.from(user));
    }
}