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
import java.util.regex.Pattern;

@Component
public class UserRepository {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final int PASSWORD_MIN_LENGTH = 8;

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;

    public UserRepository(PasswordEncoder passwordEncoder) {
        this.userDAO = new UserDAO();
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest req) {
        if (req.getEmail() == null || !EMAIL_PATTERN.matcher(req.getEmail()).matches()) {
            throw new EntityStateException("Invalid email address format");
        }

        if (req.getPassword() == null || req.getPassword().length() < PASSWORD_MIN_LENGTH) {
            throw new EntityStateException("Invalid password: passwords need to be at least " + PASSWORD_MIN_LENGTH + " characters long");
        }

        if (!userDAO.getByEmail(req.getEmail()).isEmpty()) {
            throw new EntityStateException("User with this email already exists");
        }

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