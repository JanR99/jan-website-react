package de.jan.user.repository;

import de.jan.controller.requests.LoginRequest;
import de.jan.controller.requests.RegisterRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.mail.ConfirmationMailService;
import de.jan.mail.RegistrationMailService;
import de.jan.user.EmailConfirmationToken;
import de.jan.user.EmailConfirmationTokenDAO;
import de.jan.user.User;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Date;
import java.util.List;

/**
 * A new account has to confirm its email address through a mail link before it can log in.
 * Accounts that aren't confirmed within VALIDITY are deleted again, see deleteExpiredAccounts.
 */
@Component
public class EmailConfirmationRepository {

    public static final Duration VALIDITY = Duration.ofDays(7);
    public static final String INVALID_LINK = "This confirmation link is invalid or has expired";

    private final EmailConfirmationTokenDAO tokenDAO;
    private final UserRepository userRepository;
    private final ConfirmationMailService confirmationMailService;
    private final RegistrationMailService registrationMailService;

    public EmailConfirmationRepository(UserRepository userRepository, ConfirmationMailService confirmationMailService,
                                       RegistrationMailService registrationMailService) {
        this.tokenDAO = new EmailConfirmationTokenDAO();
        this.userRepository = userRepository;
        this.confirmationMailService = confirmationMailService;
        this.registrationMailService = registrationMailService;
    }

    public User register(RegisterRequest request) {
        User user = userRepository.register(request);
        sendLink(user);
        return user;
    }

    public void resend(LoginRequest request) {
        User user = userRepository.checkCredentials(request);
        if (!user.isEmailConfirmed()) {
            user.setUnconfirmedSince(new Date());
            sendLink(userRepository.save(user));
        }
    }

    public User confirm(String token) {
        if (token == null || token.isBlank()) {
            throw new EntityStateException(INVALID_LINK);
        }
        List<EmailConfirmationToken> matches = tokenDAO.getByTokenHash(new OneTimeToken(token).hash());
        if (matches.isEmpty()) {
            throw new EntityStateException(INVALID_LINK);
        }
        EmailConfirmationToken confirmationToken = matches.getFirst();
        User user = userRepository.getById(confirmationToken.getUserId());
        if (confirmationToken.isExpired() || user == null) {
            tokenDAO.delete(confirmationToken);
            throw new EntityStateException(INVALID_LINK);
        }

        User confirmed = userRepository.confirmEmail(user);
        deleteTokensOf(confirmed);
        registrationMailService.send(confirmed);
        return confirmed;
    }

    public int deleteExpiredAccounts() {
        Date before = new Date(System.currentTimeMillis() - VALIDITY.toMillis());
        List<User> expired = userRepository.getUnconfirmedSince(before);
        expired.forEach(userRepository::deleteUnconfirmed);
        return expired.size();
    }

    private void sendLink(User user) {
        deleteTokensOf(user);
        OneTimeToken token = new OneTimeToken();
        Date expiresAt = new Date(System.currentTimeMillis() + VALIDITY.toMillis());
        tokenDAO.save(new EmailConfirmationToken(token.hash(), user.getId(), expiresAt));
        confirmationMailService.send(new ConfirmationMailService.ConfirmationMail(user, token.token(), VALIDITY.toDays()));
    }

    private void deleteTokensOf(User user) {
        List<EmailConfirmationToken> existing = tokenDAO.getByUserId(user.getId());
        if (!existing.isEmpty()) {
            tokenDAO.deleteAll(existing);
        }
    }
}
