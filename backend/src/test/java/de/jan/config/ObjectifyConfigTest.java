package de.jan.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ObjectifyConfigTest {

    @Test
    void withoutCloudRunAndEmulator_refusesToStart() {
        IllegalStateException e = assertThrows(IllegalStateException.class, () -> new ObjectifyConfig(new CloudRun()).init(false, null));
        assertTrue(e.getMessage().startsWith("Refusing to start"));
    }
}
