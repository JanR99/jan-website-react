package de.jan.user.repository;

import de.jan.controller.requests.LoginRequest;
import de.jan.controller.requests.RegisterRequest;
import de.jan.exceptions.EntityNotFoundException;
import de.jan.exceptions.EntityStateException;
import de.jan.mail.RegistrationMailService;
import de.jan.user.User;
import de.jan.user.UserDAO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Component
public class UserRepository {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final int PASSWORD_MIN_LENGTH = 8;

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;
    private final RegistrationMailService registrationMailService;

    public UserRepository(PasswordEncoder passwordEncoder, RegistrationMailService registrationMailService) {
        this.userDAO = new UserDAO();
        this.passwordEncoder = passwordEncoder;
        this.registrationMailService = registrationMailService;
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public User register(RegisterRequest req) {
        if (req.getEmail() == null || !EMAIL_PATTERN.matcher(req.getEmail()).matches()) {
            throw new EntityStateException("Invalid email address format");
        }

        validatePassword(req.getPassword());

        String email = normalizeEmail(req.getEmail());

        if (!userDAO.getByEmail(email).isEmpty()) {
            throw new EntityStateException("User with this email already exists");
        }

        String hashedPassword = passwordEncoder.encode(req.getPassword());
        User user = new User(email, hashedPassword, req.getFirstname(), req.getLastname());
        User savedUser = save(user);
        registrationMailService.send(savedUser);
        return savedUser;
    }

    public User login(LoginRequest request) {
        String credentialsMessage = "Invalid credentials";
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new EntityStateException("Email or password is null");
        }
        User user = getByEmail(request.getEmail());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getHashedPassword())) {
            throw new EntityStateException(credentialsMessage);
        }
        return user;
    }

    public User changePassword(User user, String newPassword) {
        validatePassword(newPassword);
        user.setHashedPassword(passwordEncoder.encode(newPassword));
        return save(user);
    }

    private static void validatePassword(String password) {
        if (password == null || password.length() < PASSWORD_MIN_LENGTH) {
            throw new EntityStateException("Invalid password: passwords need to be at least " + PASSWORD_MIN_LENGTH + " characters long");
        }
    }

    public User setAdminStatus(String targetEmail, boolean isAdmin) {
        User target = getByEmail(targetEmail);
        if (target == null) {
            throw new EntityNotFoundException("User with email " + targetEmail + " not found");
        }
        target.setAdmin(isAdmin);
        return userDAO.save(target);
    }

    public User save(User user) {
        if (user.getEmail() == null || user.getHashedPassword() == null) {
            throw new EntityStateException("Email or password is null");
        }
        return userDAO.save(user);
    }

    public User getById(Long id) {
        return id == null ? null : userDAO.getById(id);
    }

    public User getByEmail(String email) {
        List<User> users = userDAO.getByEmail(normalizeEmail(email));
        return users.isEmpty() ? null : users.getFirst();
    }
}