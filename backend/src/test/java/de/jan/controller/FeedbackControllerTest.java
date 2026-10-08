package de.jan.controller;

import de.jan.controller.requests.FeedbackRequest;
import de.jan.feedback.FeedbackDTO;
import de.jan.feedback.repository.FeedbackRepository;
import de.jan.role.Permission;
import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FeedbackControllerTest extends ControllerTest {

    private static final String MISSING_PERMISSION = "Missing permission MANAGE_FEEDBACK";

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Nested
    class SubmitFeedback {

        @Test
        void withoutLogin_returns401AndStoresNothing() throws Exception {
            mockMvc.perform(post("/api/feedback/submit")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Die Suche findet nichts", "/cookbook"))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));

            assertStored(0);
        }

        @Test
        void withLogin_storesTheFeedbackWithNameEmailAndPage() throws Exception {
            User user = userWith();

            mockMvc.perform(post("/api/feedback/submit")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Die Suche findet nichts", "/cookbook"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").isNumber())
                    .andExpect(jsonPath("$.text").value("Die Suche findet nichts"))
                    .andExpect(jsonPath("$.page").value("/cookbook"))
                    .andExpect(jsonPath("$.userName").value(user.getFirstname() + " " + user.getLastname()))
                    .andExpect(jsonPath("$.userEmail").value(user.getEmail()))
                    .andExpect(jsonPath("$.createdAt").isString())
                    .andExpect(jsonPath("$.done").value(false));

            assertStored(1);
        }

        @Test
        void keepsParagraphsButCleansUpTheRest() throws Exception {
            mockMvc.perform(post("/api/feedback/submit")
                            .header(HttpHeaders.AUTHORIZATION, bearer(userWith()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("  Erste Zeile\r\nzweite Zeile\n\n\n\nNeuer Absatz  ", "  /reisen/1 "))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.text").value("Erste Zeile\nzweite Zeile\n\nNeuer Absatz"))
                    .andExpect(jsonPath("$.page").value("/reisen/1"));
        }

        @Test
        void withPageThatIsNoPathOfTheWebsite_storesNoPage() throws Exception {
            mockMvc.perform(post("/api/feedback/submit")
                            .header(HttpHeaders.AUTHORIZATION, bearer(userWith()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Hallo", "https://example.com/"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page").value(""));
        }

        @Test
        void withoutPage_storesNoPage() throws Exception {
            mockMvc.perform(post("/api/feedback/submit")
                            .header(HttpHeaders.AUTHORIZATION, bearer(userWith()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Hallo", null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page").value(""));
        }

        @Test
        void withEmptyText_returns400AndStoresNothing() throws Exception {
            mockMvc.perform(post("/api/feedback/submit")
                            .header(HttpHeaders.AUTHORIZATION, bearer(userWith()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request(" \n ", "/"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Text must not be empty"));

            assertStored(0);
        }

        @Test
        void withLongestText_isAllowed() throws Exception {
            mockMvc.perform(post("/api/feedback/submit")
                            .header(HttpHeaders.AUTHORIZATION, bearer(userWith()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("x".repeat(FeedbackRepository.TEXT_MAX_LENGTH), "/"))))
                    .andExpect(status().isOk());
        }

        @Test
        void withTooLongText_returns400() throws Exception {
            mockMvc.perform(post("/api/feedback/submit")
                            .header(HttpHeaders.AUTHORIZATION, bearer(userWith()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("x".repeat(FeedbackRepository.TEXT_MAX_LENGTH + 1), "/"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Text must be at most 2000 characters long"));
        }

        @Test
        void overTheLimit_returns400ButOtherUsersCanStillSend() throws Exception {
            User user = userWith();
            for (int i = 0; i < FeedbackRepository.LIMIT_PER_USER; i++) {
                storedFeedback(user, "Feedback " + i);
            }

            mockMvc.perform(post("/api/feedback/submit")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Noch eins", "/"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Too much feedback, please try again later"));

            mockMvc.perform(post("/api/feedback/submit")
                            .header(HttpHeaders.AUTHORIZATION, bearer(userWith()))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Von jemand anderem", "/"))))
                    .andExpect(status().isOk());

            assertStored(FeedbackRepository.LIMIT_PER_USER + 1);
        }
    }

    @Nested
    class ListFeedback {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/feedback/list"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403() throws Exception {
            mockMvc.perform(get("/api/feedback/list").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));
        }

        @Test
        void withPermission_returnsTheOpenOnesFirstAndTheNewestFirst() throws Exception {
            User user = userWith();
            FeedbackDTO first = storedFeedback(user, "Erstes");
            Thread.sleep(5);
            storedFeedback(user, "Zweites");
            Thread.sleep(5);
            storedFeedback(user, "Drittes");
            inDatastore(() -> feedbackRepository.setDone(first.getId(), true));
            FeedbackDTO done = inDatastore(() -> feedbackRepository.setDone(
                    feedbackRepository.list().stream().filter(f -> f.getText().equals("Drittes")).findFirst().orElseThrow().getId(), true));

            mockMvc.perform(get("/api/feedback/list").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_FEEDBACK)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(3)))
                    .andExpect(jsonPath("$[*].text", contains("Zweites", "Drittes", "Erstes")))
                    .andExpect(jsonPath("$[*].done", contains(false, true, true)))
                    .andExpect(jsonPath("$[1].id").value(done.getId()));
        }

        @Test
        void asAdmin_isAllowed() throws Exception {
            mockMvc.perform(get("/api/feedback/list").header(HttpHeaders.AUTHORIZATION, bearer(adminUser())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    class SetFeedbackDone {

        @Test
        void withoutLogin_returns401() throws Exception {
            FeedbackDTO feedback = storedFeedback(userWith(), "Hallo");

            mockMvc.perform(post("/api/feedback/setDone").param("id", feedback.getId().toString()).param("done", "true"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void withoutPermission_returns403AndChangesNothing() throws Exception {
            FeedbackDTO feedback = storedFeedback(userWith(), "Hallo");

            mockMvc.perform(post("/api/feedback/setDone").param("id", feedback.getId().toString()).param("done", "true")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/feedback/list").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_FEEDBACK)))
                    .andExpect(jsonPath("$[0].done").value(false));
        }

        @Test
        void withPermission_marksItAsDoneAndOpenAgain() throws Exception {
            FeedbackDTO feedback = storedFeedback(userWith(), "Hallo");
            String manager = bearerWith(Permission.MANAGE_FEEDBACK);

            mockMvc.perform(post("/api/feedback/setDone").param("id", feedback.getId().toString()).param("done", "true")
                            .header(HttpHeaders.AUTHORIZATION, manager))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(feedback.getId()))
                    .andExpect(jsonPath("$.done").value(true));

            mockMvc.perform(post("/api/feedback/setDone").param("id", feedback.getId().toString()).param("done", "false")
                            .header(HttpHeaders.AUTHORIZATION, manager))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.done").value(false));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/feedback/setDone").param("id", "12345").param("done", "true")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_FEEDBACK)))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Feedback 12345 not found"));
        }
    }

    @Nested
    class DeleteFeedback {

        @Test
        void withoutLogin_returns401() throws Exception {
            FeedbackDTO feedback = storedFeedback(userWith(), "Hallo");

            mockMvc.perform(post("/api/feedback/delete").param("id", feedback.getId().toString()))
                    .andExpect(status().isUnauthorized());

            assertStored(1);
        }

        @Test
        void withoutPermission_returns403AndKeepsIt() throws Exception {
            FeedbackDTO feedback = storedFeedback(userWith(), "Hallo");

            mockMvc.perform(post("/api/feedback/delete").param("id", feedback.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            assertStored(1);
        }

        @Test
        void withPermission_deletesIt() throws Exception {
            FeedbackDTO feedback = storedFeedback(userWith(), "Hallo");
            storedFeedback(userWith(), "Bleibt");

            mockMvc.perform(post("/api/feedback/delete").param("id", feedback.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_FEEDBACK)))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/feedback/list").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_FEEDBACK)))
                    .andExpect(jsonPath("$[*].text", contains("Bleibt")));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/feedback/delete").param("id", "12345")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_FEEDBACK)))
                    .andExpect(status().isNotFound());
        }
    }

    private static FeedbackRequest request(String text, String page) {
        FeedbackRequest request = new FeedbackRequest();
        request.setText(text);
        request.setPage(page);
        return request;
    }

    private FeedbackDTO storedFeedback(User user, String text) {
        return inDatastore(() -> feedbackRepository.submit(user, request(text, "/cookbook")));
    }

    private void assertStored(int count) throws Exception {
        mockMvc.perform(get("/api/feedback/list").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_FEEDBACK)))
                .andExpect(jsonPath("$", hasSize(count)));
    }
}
