package de.jan.user.repository;

import de.jan.exceptions.EntityStateException;
import de.jan.testsupport.ControllerTest;
import de.jan.user.PasswordResetToken;
import de.jan.user.PasswordResetTokenDAO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class PasswordResetRepositoryTest extends ControllerTest {

    @Autowired
    private PasswordResetRepository passwordResetRepository;

    @Test
    void linkOfADeletedAccount_isInvalidAndIsDeleted() {
        // a valid link whose user isn't there any more
        inDatastore(() -> new PasswordResetTokenDAO().save(new PasswordResetToken(
                new OneTimeToken("the-token").hash(), 999_999L, new Date(System.currentTimeMillis() + 60_000))));

        EntityStateException e = assertThrows(EntityStateException.class,
                () -> inDatastore(() -> passwordResetRepository.resetPassword("the-token", "password-123")));

        assertEquals("This reset link is invalid or has expired", e.getMessage());
        assertTrue(inDatastore(() -> new PasswordResetTokenDAO().getAll()).isEmpty());
    }
}
