package de.jan.user.repository;

import de.jan.controller.requests.LoginRequest;
import de.jan.controller.requests.RegisterRequest;
import de.jan.exceptions.EntityNotFoundException;
import de.jan.exceptions.EntityStateException;
import de.jan.exceptions.UnauthorizedException;
import de.jan.role.Permission;
import de.jan.role.Role;
import de.jan.role.repository.RoleRepository;
import de.jan.user.*;
import de.jan.util.TextRules;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class UserRepository {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final int PASSWORD_MIN_LENGTH = 8;
    private static final int NAME_MAX_LENGTH = 100;
    private static final int EMAIL_MAX_LENGTH = 254;
    public static final String NOT_CONFIRMED = "Email address not confirmed";

    private final UserDAO userDAO;
    private final PasswordResetTokenDAO passwordResetTokenDAO;
    private final EmailConfirmationTokenDAO confirmationTokenDAO;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    /** whatever else keeps data of a user, deleted with the account */
    private final List<UserDataOwner> userDataOwners;

    public UserRepository(PasswordEncoder passwordEncoder, RoleRepository roleRepository,
                          List<UserDataOwner> userDataOwners) {
        this.userDAO = new UserDAO();
        this.passwordResetTokenDAO = new PasswordResetTokenDAO();
        this.confirmationTokenDAO = new EmailConfirmationTokenDAO();
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.userDataOwners = userDataOwners;
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public User register(RegisterRequest req) {
        if (req.email() == null || !EMAIL_PATTERN.matcher(req.email()).matches()) {
            throw new EntityStateException("Invalid email address format");
        }
        TextRules.requireMaxLength(req.email(), "Email", EMAIL_MAX_LENGTH);

        String firstname = validateName(req.firstname());
        String lastname = validateName(req.lastname());

        validatePassword(req.password());

        String email = normalizeEmail(req.email());

        String hashedPassword = passwordEncoder.encode(req.password());
        User existing = getByEmail(email);
        if (existing != null && existing.isEmailConfirmed()) {
            throw new EntityStateException("User with this email already exists");
        }
        // an account that was never confirmed doesn't keep the address: registering again starts it anew
        User user = existing != null ? existing : new User(email, hashedPassword, firstname, lastname);
        user.setFirstname(firstname);
        user.setLastname(lastname);
        user.setHashedPassword(hashedPassword);
        user.setUnconfirmedSince(new Date());
        return save(user);
    }

    public User checkCredentials(LoginRequest request) {
        if (request.email() == null || request.password() == null) {
            throw new EntityStateException("Email or password is null");
        }
        User user = getByEmail(request.email());
        if (user == null || !passwordEncoder.matches(request.password(), user.getHashedPassword())) {
            throw new EntityStateException("Invalid credentials");
        }
        return user;
    }

    public User login(LoginRequest request) {
        User user = checkCredentials(request);
        if (!user.isEmailConfirmed()) {
            throw new UnauthorizedException(NOT_CONFIRMED);
        }
        return user;
    }

    public User confirmEmail(User user) {
        user.setUnconfirmedSince(null);
        return save(user);
    }

    public List<User> getUnconfirmedSince(Date before) {
        return userDAO.getUnconfirmedSince(before).stream().filter(user -> !user.isEmailConfirmed()).toList();
    }

    public void deleteUnconfirmed(User user) {
        if (!user.isEmailConfirmed()) {
            delete(user);
        }
    }

    public User changePassword(User user, String newPassword) {
        validatePassword(newPassword);
        user.setHashedPassword(passwordEncoder.encode(newPassword));
        // logs the account out everywhere, see User.tokenVersion
        user.setTokenVersion(user.getTokenVersion() + 1);
        return save(user);
    }

    /**
     * Changes the password of a logged-in user after re-checking the current one.
     * Reset links that are still open stop working, as they do after a reset.
     */
    public User changeOwnPassword(User user, String currentPassword, String newPassword) {
        if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getHashedPassword())) {
            throw new EntityStateException("Invalid password");
        }
        User updated = changePassword(user, newPassword);
        passwordResetTokenDAO.deleteByUserId(user.getId());
        return updated;
    }

    public User updateName(User user, String firstname, String lastname) {
        user.setFirstname(validateName(firstname));
        user.setLastname(validateName(lastname));
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

        delete(user);
    }

    /**
     * Deletes another user's account, from the user management. Admin accounts are protected like with
     * deleteAccount, and the own account can only be deleted in the profile, with the password.
     */
    public void deleteUser(User caller, Long targetId) {
        User target = getById(targetId);
        if (target == null) {
            throw new EntityNotFoundException("User with id " + targetId + " not found");
        }
        if (target.getId().equals(caller.getId())) {
            throw new EntityStateException("You can only delete your own account in your profile");
        }
        if (roleRepository.hasAdminRole(target)) {
            throw new EntityStateException("Admin accounts cannot be deleted");
        }

        delete(target);
    }

    private void delete(User user) {
        passwordResetTokenDAO.deleteByUserId(user.getId());
        confirmationTokenDAO.deleteByUserId(user.getId());
        userDataOwners.forEach(owner -> owner.deleteDataOf(user));
        userDAO.delete(user);
    }

    private static String validateName(String name) {
        String trimmed = name == null ? "" : name.trim();
        TextRules.require(trimmed, "First- and Surname", NAME_MAX_LENGTH);
        return trimmed;
    }

    private static void validatePassword(String password) {
        if (password == null || password.length() < PASSWORD_MIN_LENGTH) {
            throw new EntityStateException("Invalid password: passwords need to be at least " + PASSWORD_MIN_LENGTH + " characters long");
        }
    }

    public List<User> getAll() {
        return userDAO.getAll().stream()
                .sorted(Comparator.comparing(User::getEmail))
                .toList();
    }

    /**
     * Replaces the roles of a user. Nobody can take away their own MANAGE_USERS permission,
     * so there is always someone left who can manage users.
     */
    public User setRoles(User caller, String targetEmail, Set<Long> roleIds) {
        if (targetEmail == null || targetEmail.isBlank()) {
            throw new EntityStateException("Email must not be empty");
        }
        User target = getByEmail(targetEmail);
        if (target == null) {
            throw new EntityNotFoundException("User with email " + targetEmail + " not found");
        }
        Set<Long> validated = roleRepository.validateRoleIds(roleIds);
        if (target.getId().equals(caller.getId())
                && !roleRepository.permissionsOf(validated).contains(Permission.MANAGE_USERS)) {
            throw new EntityStateException("You cannot take away your own permission to manage users");
        }
        target.setRoleIds(validated);
        return userDAO.save(target);
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
        return id == null ? null : userDAO.get(id);
    }

    public User getByEmail(String email) {
        List<User> users = userDAO.getByEmail(normalizeEmail(email));
        return users.isEmpty() ? null : users.getFirst();
    }
}