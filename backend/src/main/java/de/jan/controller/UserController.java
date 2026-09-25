package de.jan.controller;

import de.jan.user.User;
import de.jan.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestBody User user
    ) {
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("getUserByEmail")
    public ResponseEntity<User> getUserByEmail(
            @RequestParam("email") String email
    ) {
        User user = userRepository.getByEmail(email);
        return ResponseEntity.ok(user);
    }
}