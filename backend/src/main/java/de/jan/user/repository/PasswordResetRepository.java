package de.jan.user.repository;

import de.jan.mail.LinkMailService;
import de.jan.mail.PasswordResetMailService;
import de.jan.user.PasswordResetToken;
import de.jan.user.PasswordResetTokenDAO;
import de.jan.user.User;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class PasswordResetRepository {

    private static final Duration VALIDITY = Duration.ofMinutes(30);
    private static final String INVALID_LINK = "This reset link is invalid or has expired";

    private final MailLinks<PasswordResetToken> links;
    private final UserRepository userRepository;
    private final PasswordResetMailService mailService;

    public PasswordResetRepository(UserRepository userRepository, PasswordResetMailService mailService) {
        this.links = new MailLinks<>(new PasswordResetTokenDAO(), PasswordResetToken::new, VALIDITY, INVALID_LINK,
                userRepository);
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

        String token = links.issue(user);
        mailService.send(new LinkMailService.LinkMail(user, token, VALIDITY.toMinutes()));
    }

    public User resetPassword(String token, String newPassword) {
        User user = links.redeem(token);
        // validates the password first, so an invalid one does not burn the link
        User updated = userRepository.changePassword(user, newPassword);
        links.deleteOf(user);
        return updated;
    }
}
