package de.jan.config;

import de.jan.role.Role;
import de.jan.role.repository.RoleRepository;
import de.jan.testsupport.ControllerTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RoleBootstrapConfigTest extends ControllerTest {

    @Test
    void createsTheAdminRole() {
        new RoleBootstrapConfig(roleRepository).afterSingletonsInstantiated();

        assertTrue(inDatastore(() -> roleRepository.getAll()).stream().anyMatch(role -> Role.ADMIN.equals(role.getName())));
    }

    @Test
    void failingDatabase_doesNotStopTheStart() {
        RoleRepository failing = mock(RoleRepository.class);
        when(failing.ensureAdminRole()).thenThrow(new IllegalStateException("database down"));

        assertDoesNotThrow(() -> new RoleBootstrapConfig(failing).afterSingletonsInstantiated());
    }
}
