package de.jan.controller;

import de.jan.controller.requests.CrosswordResultRequest;
import de.jan.games.CrosswordStatsDAO;
import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GamesControllerTest extends ControllerTest {

    private static CrosswordResultRequest result(String script, String level, boolean solved, int rightWords) {
        CrosswordResultRequest result = new CrosswordResultRequest();
        result.setScript(script);
        result.setLevel(level);
        result.setSolved(solved);
        result.setRightWords(rightWords);
        return result;
    }

    private void record(User user, CrosswordResultRequest result) throws Exception {
        mockMvc.perform(post("/api/games/crossword/result")
                        .header(HttpHeaders.AUTHORIZATION, bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(result)))
                .andExpect(status().isOk());
    }

    @Nested
    class GetCrosswordStats {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/games/crossword/stats"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutGames_returnsZeros() throws Exception {
            mockMvc.perform(get("/api/games/crossword/stats")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.solved").value(0))
                    .andExpect(jsonPath("$.words").value(0))
                    .andExpect(jsonPath("$.currentStreak").value(0))
                    .andExpect(jsonPath("$.bestStreak").value(0))
                    .andExpect(jsonPath("$.levels", hasSize(0)));
        }

        @Test
        void returnsOnlyTheNumbersOfTheCaller() throws Exception {
            User user = userWith();
            User other = userWith();
            record(other, result("hiragana", "A1", true, 8));

            mockMvc.perform(get("/api/games/crossword/stats")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.solved").value(0))
                    .andExpect(jsonPath("$.levels", hasSize(0)));
        }
    }

    @Nested
    class RecordCrosswordResult {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(post("/api/games/crossword/result")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(result("hiragana", "A1", true, 8))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void solvedCrosswords_countPerScriptAndLevel() throws Exception {
            User user = userWith();
            record(user, result("hiragana", "A1", true, 8));
            record(user, result("hiragana", "A1", true, 6));

            mockMvc.perform(post("/api/games/crossword/result")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(result("katakana", "B1", true, 7))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.solved").value(3))
                    .andExpect(jsonPath("$.words").value(21))
                    .andExpect(jsonPath("$.currentStreak").value(3))
                    .andExpect(jsonPath("$.bestStreak").value(3))
                    .andExpect(jsonPath("$.levels", hasSize(2)))
                    .andExpect(jsonPath("$.levels[0].script").value("hiragana"))
                    .andExpect(jsonPath("$.levels[0].level").value("A1"))
                    .andExpect(jsonPath("$.levels[0].solved").value(2))
                    .andExpect(jsonPath("$.levels[0].words").value(14))
                    .andExpect(jsonPath("$.levels[1].script").value("katakana"))
                    .andExpect(jsonPath("$.levels[1].level").value("B1"))
                    .andExpect(jsonPath("$.levels[1].solved").value(1));
        }

        @Test
        void shownSolution_endsTheStreakButKeepsTheRightWords() throws Exception {
            User user = userWith();
            record(user, result("hiragana", "A1", true, 8));
            record(user, result("hiragana", "A1", true, 8));

            mockMvc.perform(post("/api/games/crossword/result")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(result("hiragana", "A1", false, 3))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.solved").value(2))
                    .andExpect(jsonPath("$.words").value(19))
                    .andExpect(jsonPath("$.currentStreak").value(0))
                    .andExpect(jsonPath("$.bestStreak").value(2));
        }

        @Test
        void unknownScript_returns400() throws Exception {
            mockMvc.perform(post("/api/games/crossword/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(result("kanji", "A1", true, 8))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Script must be one of [hiragana, katakana]"));
        }

        @Test
        void unknownLevel_returns400() throws Exception {
            mockMvc.perform(post("/api/games/crossword/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(result("hiragana", "D1", true, 8))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Level must be one of [A1, A2, B1, B2, C1, C2]"));
        }

        @Test
        void tooManyWords_returns400() throws Exception {
            mockMvc.perform(post("/api/games/crossword/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(result("hiragana", "A1", true, 51))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Right words must be between 0 and 50"));
        }

        @Test
        void deletedAccount_takesItsNumbersWithIt() throws Exception {
            User user = userWith();
            record(user, result("hiragana", "A1", true, 8));

            inDatastore(() -> {
                userRepository.deleteAccount(userRepository.getByEmail(user.getEmail()), passwordOf(user));
                return null;
            });

            assertNull(inDatastore(() -> new CrosswordStatsDAO().getById(user.getId())));
        }
    }

    /** userWith() registers "userN@example.com" with the password "password-N". */
    private static String passwordOf(User user) {
        return "password-" + user.getEmail().replaceAll("\\D", "");
    }
}
