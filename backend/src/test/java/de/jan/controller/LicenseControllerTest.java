package de.jan.controller;

import de.jan.testsupport.ControllerTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class LicenseControllerTest extends ControllerTest {

    /** mvn test runs the license-maven-plugin first, so the list of the build is there. */
    @Test
    void withoutLogin_returnsTheLibrariesOfTheBuild() throws Exception {
        mockMvc.perform(get("/api/licenses/backend"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[*].artifact", hasItem("org.springframework.boot:spring-boot")));
    }
}
