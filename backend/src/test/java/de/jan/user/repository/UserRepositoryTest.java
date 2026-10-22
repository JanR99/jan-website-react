package de.jan.user.repository;

import de.jan.controller.requests.RegisterRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class UserRepositoryTest extends ControllerTest {

    @Test
    void register_withoutName_isRejected() {
        RegisterRequest request = new RegisterRequest("anna@example.com", "password-123", " ", "Berg");

        EntityStateException e = assertThrows(EntityStateException.class, () -> inDatastore(() -> userRepository.register(request)));
        assertEquals("First- and Surname must not be empty", e.getMessage());
    }

    @Test
    void save_withoutEmailOrPassword_isRejected() {
        EntityStateException withoutEmail = assertThrows(EntityStateException.class,
                () -> inDatastore(() -> userRepository.save(new User(null, "hash", "Anna", "Berg"))));
        EntityStateException withoutPassword = assertThrows(EntityStateException.class,
                () -> inDatastore(() -> userRepository.save(new User("anna@example.com", null, "Anna", "Berg"))));

        assertEquals("Email or password is null", withoutEmail.getMessage());
        assertEquals("Email or password is null", withoutPassword.getMessage());
    }
}
