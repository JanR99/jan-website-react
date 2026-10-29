package de.jan.config;

import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import de.jan.user.repository.UserRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminBootstrapConfigTest extends ControllerTest {

    private void bootstrap(String email, String password) throws Exception {
        new AdminBootstrapConfig().bootstrapAdmin(userRepository, email, password).run();
    }

    private User stored(String email) {
        return inDatastore(() -> userRepository.getByEmail(email));
    }

    private boolean isAdmin(User user) {
        return inDatastore(() -> roleRepository.hasAdminRole(user));
    }

    @Test
    void withoutEmail_doesNothing() throws Exception {
        bootstrap("", "password-123");
        bootstrap(null, "password-123");

        assertEquals(0, inDatastore(() -> userRepository.getAll()).size());
    }

    @Test
    void newEmailWithPassword_createsAnAdmin() throws Exception {
        bootstrap("boss@example.com", "password-123");

        User admin = stored("boss@example.com");
        assertNotNull(admin);
        assertEquals("Admin", admin.getFirstname());
        assertTrue(isAdmin(admin));
        assertTrue(admin.isEmailConfirmed());
    }

    @Test
    void existingUser_becomesAdmin() throws Exception {
        User user = userWith();

        bootstrap(user.getEmail(), "");

        assertTrue(isAdmin(stored(user.getEmail())));
    }

    @Test
    void newEmailWithoutPassword_createsNobody() throws Exception {
        bootstrap("boss@example.com", " ");

        assertNull(stored("boss@example.com"));
    }

    @Test
    void passwordTooShort_createsNobody() throws Exception {
        bootstrap("boss@example.com", "short");

        assertNull(stored("boss@example.com"));
    }

    @Test
    void failingDatabase_doesNotStopTheStart() {
        UserRepository failing = mock(UserRepository.class);
        when(failing.getByEmail(anyString())).thenThrow(new IllegalStateException("database down"));

        assertDoesNotThrow(() -> new AdminBootstrapConfig().bootstrapAdmin(failing, "boss@example.com", "password-123").run());
    }
}
