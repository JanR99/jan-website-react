package de.jan.user.repository;

import de.jan.controller.requests.LoginRequest;
import de.jan.controller.requests.RegisterRequest;
import de.jan.exceptions.EntityNotFoundException;
import de.jan.exceptions.EntityStateException;
import de.jan.user.User;
import de.jan.user.UserDAO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserRepository {

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;

    public UserRepository(PasswordEncoder passwordEncoder) {
        this.userDAO = new UserDAO();
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest req) {
        String hashedPassword = passwordEncoder.encode(req.getPassword());
        User user = new User(req.getEmail(), hashedPassword, req.getFirstname(), req.getLastname());
        return save(user);
    }

    public User login(LoginRequest request) {
        String credentialsMessage = "Invalid credentials";
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new EntityStateException("Email or password is null");
        }
        try {
            User user = getByEmail(request.getEmail());
            if (!passwordEncoder.matches(request.getPassword(), user.getHashedPassword())) {
                throw new EntityStateException(credentialsMessage);
            }
            return user;
        } catch (EntityNotFoundException e) {
            throw new EntityStateException(credentialsMessage);
        }
    }

    public User setAdminStatus(String targetEmail, boolean isAdmin) {
        User target = getByEmail(targetEmail);
        target.setAdmin(isAdmin);
        return userDAO.save(target);
    }

    public User save(User user) {
        if (user.getEmail() == null || user.getHashedPassword() == null) {
            throw new EntityStateException("Email or password is null");
        }
        return userDAO.save(user);
    }

    public User getByEmail(String email) {
        List<User> users = userDAO.getByEmail(email);
        if (users.isEmpty()) {
            throw new EntityNotFoundException("User with email " + email + " not found");
        }
        return users.getFirst();
    }
}