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

        if (req.getPassword() == null || req.getPassword().length() < PASSWORD_MIN_LENGTH) {
            throw new EntityStateException("Invalid password: passwords need to be at least " + PASSWORD_MIN_LENGTH + " characters long");
        }

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
        try {
            User user = getByEmail(normalizeEmail(request.getEmail()));
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
        List<User> users = userDAO.getByEmail(normalizeEmail(email));
        return users.isEmpty() ? null : users.getFirst();
    }
}