package de.jan.user.repository;

import de.jan.exceptions.EntityStateException;
import de.jan.mail.PasswordResetMailService;
import de.jan.user.PasswordResetToken;
import de.jan.user.PasswordResetTokenDAO;
import de.jan.user.User;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;

@Component
public class PasswordResetRepository {

    private static final Duration VALIDITY = Duration.ofMinutes(30);
    private static final int TOKEN_BYTES = 32;
    private static final String INVALID_LINK = "This reset link is invalid or has expired";

    private final SecureRandom random = new SecureRandom();
    private final PasswordResetTokenDAO tokenDAO;
    private final UserRepository userRepository;
    private final PasswordResetMailService mailService;

    public PasswordResetRepository(UserRepository userRepository, PasswordResetMailService mailService) {
        this.tokenDAO = new PasswordResetTokenDAO();
        this.userRepository = userRepository;
        this.mailService = mailService;
    }

    public void requestReset(String email) {
        if (email == null || email.isBlank()) {
            return;
        }
        User user = userRepository.getByEmail(email);
        if (user == null) {
            return;
        }

        // only the newest link stays valid
        deleteTokensOf(user);

        String token = newToken();
        Date expiresAt = new Date(System.currentTimeMillis() + VALIDITY.toMillis());
        tokenDAO.save(new PasswordResetToken(hash(token), user.getId(), expiresAt));
        mailService.send(new PasswordResetMailService.ResetMail(user, token, VALIDITY.toMinutes()));
    }

    public User resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new EntityStateException(INVALID_LINK);
        }
        List<PasswordResetToken> matches = tokenDAO.getByTokenHash(hash(token));
        if (matches.isEmpty()) {
            throw new EntityStateException(INVALID_LINK);
        }
        PasswordResetToken resetToken = matches.getFirst();
        if (resetToken.isExpired()) {
            tokenDAO.delete(resetToken);
            throw new EntityStateException(INVALID_LINK);
        }
        User user = userRepository.getById(resetToken.getUserId());
        if (user == null) {
            tokenDAO.delete(resetToken);
            throw new EntityStateException(INVALID_LINK);
        }

        // validates the password first, so an invalid one does not burn the link
        User updated = userRepository.changePassword(user, newPassword);
        deleteTokensOf(user);
        return updated;
    }

    private void deleteTokensOf(User user) {
        List<PasswordResetToken> existing = tokenDAO.getByUserId(user.getId());
        if (!existing.isEmpty()) {
            tokenDAO.deleteAll(existing);
        }
    }

    private String newToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
