package de.jan.user.repository;

import de.jan.controller.requests.LoginRequest;
import de.jan.controller.requests.RegisterRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.mail.RegistrationMailService;
import de.jan.role.Role;
import de.jan.role.repository.RoleRepository;
import de.jan.user.PasswordResetToken;
import de.jan.user.PasswordResetTokenDAO;
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
    private static final int NAME_MAX_LENGTH = 100;

    private final UserDAO userDAO;
    private final PasswordResetTokenDAO passwordResetTokenDAO;
    private final PasswordEncoder passwordEncoder;
    private final RegistrationMailService registrationMailService;
    private final RoleRepository roleRepository;

    public UserRepository(PasswordEncoder passwordEncoder, RegistrationMailService registrationMailService,
                          RoleRepository roleRepository) {
        this.userDAO = new UserDAO();
        this.passwordResetTokenDAO = new PasswordResetTokenDAO();
        this.passwordEncoder = passwordEncoder;
        this.registrationMailService = registrationMailService;
        this.roleRepository = roleRepository;
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

    public User updateName(User user, String firstname, String lastname) {
        user.setFirstname(validateName(firstname, "First name"));
        user.setLastname(validateName(lastname, "Last name"));
        return save(user);
    }

    /**
     * Deletes the account after re-checking the password. Admin accounts can't be deleted,
     * the bootstrap admin would otherwise just be recreated on the next start.
     */
    public void deleteAccount(User user, String password) {
        if (password == null || !passwordEncoder.matches(password, user.getHashedPassword())) {
            throw new EntityStateException("Invalid password");
        }
        if (roleRepository.hasAdminRole(user)) {
            throw new EntityStateException("Admin accounts cannot be deleted");
        }

        List<PasswordResetToken> resetTokens = passwordResetTokenDAO.getByUserId(user.getId());
        if (!resetTokens.isEmpty()) {
            passwordResetTokenDAO.deleteAll(resetTokens);
        }
        userDAO.delete(user);
    }

    private static String validateName(String name, String label) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new EntityStateException(label + " must not be empty");
        }
        if (trimmed.length() > NAME_MAX_LENGTH) {
            throw new EntityStateException(label + " must be at most " + NAME_MAX_LENGTH + " characters long");
        }
        return trimmed;
    }

    private static void validatePassword(String password) {
        if (password == null || password.length() < PASSWORD_MIN_LENGTH) {
            throw new EntityStateException("Invalid password: passwords need to be at least " + PASSWORD_MIN_LENGTH + " characters long");
        }
    }

    public void grantAdminRole(User user) {
        Role admin = roleRepository.ensureAdminRole();
        user.getRoleIds().add(admin.getId());
        userDAO.save(user);
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