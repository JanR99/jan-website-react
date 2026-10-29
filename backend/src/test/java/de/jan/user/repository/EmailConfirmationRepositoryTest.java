package de.jan.user.repository;

import de.jan.controller.requests.LoginRequest;
import de.jan.controller.requests.RegisterRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.testsupport.ControllerTest;
import de.jan.user.EmailConfirmationToken;
import de.jan.user.EmailConfirmationTokenDAO;
import de.jan.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class EmailConfirmationRepositoryTest extends ControllerTest {

    private static final long DAY = 24 * 60 * 60_000L;

    @Autowired
    private EmailConfirmationRepository emailConfirmationRepository;

    @Test
    void deleteExpiredAccounts_deletesOnlyAccountsUnconfirmedForMoreThanSevenDays() {
        User old = unconfirmedSince("old@example.com", 8);
        User recent = unconfirmedSince("recent@example.com", 6);
        User confirmed = userWith();

        int deleted = inDatastore(emailConfirmationRepository::deleteExpiredAccounts);

        assertEquals(1, deleted);
        assertNull(inDatastore(() -> userRepository.getById(old.getId())));
        assertNotNull(inDatastore(() -> userRepository.getById(recent.getId())));
        assertNotNull(inDatastore(() -> userRepository.getById(confirmed.getId())));
        assertTrue(inDatastore(() -> new EmailConfirmationTokenDAO().getByUserId(old.getId())).isEmpty());
    }

    @Test
    void resend_givesTheAccountTheFullSevenDaysAgain() {
        User user = unconfirmedSince("late@example.com", 8);

        inDatastore(() -> {
            emailConfirmationRepository.resend(new LoginRequest("late@example.com", "password-123", null));
            return null;
        });
        int deleted = inDatastore(emailConfirmationRepository::deleteExpiredAccounts);

        assertEquals(0, deleted);
        assertFalse(inDatastore(() -> userRepository.getById(user.getId())).isEmailConfirmed());
        assertEquals(1, inDatastore(() -> new EmailConfirmationTokenDAO().getByUserId(user.getId())).size());
    }

    @Test
    void linkOfADeletedAccount_isInvalidAndIsDeleted() {
        inDatastore(() -> new EmailConfirmationTokenDAO().save(new EmailConfirmationToken(
                new OneTimeToken("the-token").hash(), 999_999L, new Date(System.currentTimeMillis() + DAY))));

        EntityStateException e = assertThrows(EntityStateException.class,
                () -> inDatastore(() -> emailConfirmationRepository.confirm("the-token")));

        assertEquals(EmailConfirmationRepository.INVALID_LINK, e.getMessage());
        assertTrue(inDatastore(() -> new EmailConfirmationTokenDAO().getAll()).isEmpty());
    }

    private User unconfirmedSince(String email, int days) {
        RegisterRequest request = new RegisterRequest(email, "password-123", "Anna", "Test");
        return inDatastore(() -> {
            User user = emailConfirmationRepository.register(request);
            user.setUnconfirmedSince(new Date(System.currentTimeMillis() - days * DAY));
            return userRepository.save(user);
        });
    }
}
