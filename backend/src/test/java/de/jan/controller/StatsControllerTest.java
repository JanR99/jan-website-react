package de.jan.controller;

import de.jan.controller.requests.VisitRequest;
import de.jan.role.Permission;
import de.jan.stats.repository.StatsRepository;
import de.jan.testsupport.ControllerTest;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class StatsControllerTest extends ControllerTest {

    private static final String TODAY = LocalDate.now(StatsRepository.ZONE).toString();
    private static final String LAST_DAY = "$.days[" + (StatsRepository.DAYS - 1) + "]";

    private void visit(String page, boolean newVisit) throws Exception {
        mockMvc.perform(post("/api/stats/visit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new VisitRequest(page, newVisit))))
                .andExpect(status().isNoContent());
    }

    @Nested
    class RecordVisit {

        @Test
        void withoutLogin_countsTheVisitAndThePage() throws Exception {
            visit("/", true);
            visit("/cookbook/12", false);

            mockMvc.perform(get("/api/stats").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.VIEW_STATS)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath(LAST_DAY + ".day").value(TODAY))
                    .andExpect(jsonPath(LAST_DAY + ".visits").value(1))
                    .andExpect(jsonPath(LAST_DAY + ".pageViews").value(2));
        }

        @Test
        void withPageThatIsNoPathOfTheWebsite_returns400() throws Exception {
            mockMvc.perform(post("/api/stats/visit")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new VisitRequest("https://example.com/", true))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The page must be a path of the website like /cookbook/12"));
        }
    }

    @Nested
    class GetStats {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/stats"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403() throws Exception {
            mockMvc.perform(get("/api/stats").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_FEEDBACK)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string("Missing permission VIEW_STATS"));
        }

        @Test
        void withPermission_returnsEveryDayOfThePeriodAndTheMostOpenedPagesFirst() throws Exception {
            visit("/reisen/5", true);
            visit("/cookbook", false);
            visit("/reisen/5", false);

            mockMvc.perform(get("/api/stats").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.VIEW_STATS)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.days", hasSize(StatsRepository.DAYS)))
                    .andExpect(jsonPath("$.days[0].visits").value(0))
                    .andExpect(jsonPath("$.pages", hasSize(2)))
                    .andExpect(jsonPath("$.pages[0].page").value("/reisen/5"))
                    .andExpect(jsonPath("$.pages[0].views").value(2))
                    .andExpect(jsonPath("$.pages[1].page").value("/cookbook"));
        }
    }
}
