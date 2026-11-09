package de.jan.controller;

import de.jan.controller.requests.CrosswordResultRequest;
import de.jan.controller.requests.KanaResultRequest;
import de.jan.controller.requests.KanjiResultRequest;
import de.jan.controller.requests.VocabResultRequest;
import de.jan.games.CrosswordStatsDAO;
import de.jan.games.KanaStatsDAO;
import de.jan.games.KanjiStatsDAO;
import de.jan.games.VocabProgress;
import de.jan.games.VocabProgressDAO;
import de.jan.games.VocabStatsDAO;
import de.jan.games.repository.VocabStatsRepository;
import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.lessThan;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class GamesControllerTest extends ControllerTest {

    private static CrosswordResultRequest result(String script, String level, boolean solved, int rightWords) {
        return new CrosswordResultRequest(script, level, solved, rightWords);
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

            assertNull(inDatastore(() -> new CrosswordStatsDAO().get(user.getId())));
        }
    }

    private static KanjiResultRequest kanjiResult(String level, Boolean... answers) {
        return new KanjiResultRequest(level, answers == null ? null : List.of(answers), null, false);
    }

    private void recordKanji(User user, KanjiResultRequest result) throws Exception {
        mockMvc.perform(post("/api/games/kanji/result")
                        .header(HttpHeaders.AUTHORIZATION, bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(result)))
                .andExpect(status().isOk());
    }

    @Nested
    class GetKanjiStats {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/games/kanji/stats"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutRounds_returnsZeros() throws Exception {
            mockMvc.perform(get("/api/games/kanji/stats")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rounds").value(0))
                    .andExpect(jsonPath("$.perfectRounds").value(0))
                    .andExpect(jsonPath("$.rightWords").value(0))
                    .andExpect(jsonPath("$.askedWords").value(0))
                    .andExpect(jsonPath("$.currentStreak").value(0))
                    .andExpect(jsonPath("$.bestStreak").value(0))
                    .andExpect(jsonPath("$.levels", hasSize(0)));
        }

        @Test
        void returnsOnlyTheNumbersOfTheCaller() throws Exception {
            User user = userWith();
            User other = userWith();
            recordKanji(other, kanjiResult("A1", true, true, false));

            mockMvc.perform(get("/api/games/kanji/stats")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rounds").value(0))
                    .andExpect(jsonPath("$.levels", hasSize(0)));
        }
    }

    @Nested
    class RecordKanjiResult {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(post("/api/games/kanji/result")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanjiResult("A1", true))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void rounds_countPerLevel() throws Exception {
            User user = userWith();
            recordKanji(user, kanjiResult("A1", true, true, true));
            recordKanji(user, kanjiResult("A1", true, false, true));

            mockMvc.perform(post("/api/games/kanji/result")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanjiResult("B1", true, true))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rounds").value(3))
                    .andExpect(jsonPath("$.perfectRounds").value(2))
                    .andExpect(jsonPath("$.rightWords").value(7))
                    .andExpect(jsonPath("$.askedWords").value(8))
                    .andExpect(jsonPath("$.levels", hasSize(2)))
                    .andExpect(jsonPath("$.levels[0].level").value("A1"))
                    .andExpect(jsonPath("$.levels[0].rounds").value(2))
                    .andExpect(jsonPath("$.levels[0].perfectRounds").value(1))
                    .andExpect(jsonPath("$.levels[0].rightWords").value(5))
                    .andExpect(jsonPath("$.levels[0].askedWords").value(6))
                    .andExpect(jsonPath("$.levels[1].level").value("B1"))
                    .andExpect(jsonPath("$.levels[1].rounds").value(1))
                    .andExpect(jsonPath("$.levels[1].perfectRounds").value(1));
        }

        @Test
        void streak_goesOnAcrossRoundsUntilAWrongWord() throws Exception {
            User user = userWith();
            recordKanji(user, kanjiResult("A1", false, true, true));

            mockMvc.perform(post("/api/games/kanji/result")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanjiResult("A1", true, true, false, true))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.currentStreak").value(1))
                    .andExpect(jsonPath("$.bestStreak").value(4));
        }

        @Test
        void unknownLevel_returns400() throws Exception {
            mockMvc.perform(post("/api/games/kanji/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanjiResult("D1", true))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Level must be one of [A1, A2, B1, B2, C1, C2]"));
        }

        @Test
        void noAnswers_returns400() throws Exception {
            mockMvc.perform(post("/api/games/kanji/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanjiResult("A1"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A round must have 1 to 20 answers"));
        }

        @Test
        void tooManyAnswers_returns400() throws Exception {
            Boolean[] answers = new Boolean[21];
            Arrays.fill(answers, true);
            mockMvc.perform(post("/api/games/kanji/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanjiResult("A1", answers))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A round must have 1 to 20 answers"));
        }

        @Test
        void deletedAccount_takesItsNumbersWithIt() throws Exception {
            User user = userWith();
            recordKanji(user, kanjiResult("A1", true, true));
            assertNotNull(inDatastore(() -> new KanjiStatsDAO().get(user.getId())));

            inDatastore(() -> {
                userRepository.deleteAccount(userRepository.getByEmail(user.getEmail()), passwordOf(user));
                return null;
            });

            assertNull(inDatastore(() -> new KanjiStatsDAO().get(user.getId())));
        }
    }

    /** A round with the given words; a word starting with "!" was read wrong, like "!本". */
    private static KanjiResultRequest kanjiRound(String level, boolean practice, String... words) {
        return new KanjiResultRequest(level,
                Arrays.stream(words).map(word -> !word.startsWith("!")).toList(),
                Arrays.stream(words).map(word -> word.replace("!", ""))
                        .map(word -> new KanjiResultRequest.Word(word, "reading of " + word, "meaning of " + word))
                        .toList(),
                practice);
    }

    @Nested
    class KanjiMistakes {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/games/kanji/mistakes"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
            mockMvc.perform(delete("/api/games/kanji/mistakes").param("word", "本"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutRounds_isEmpty() throws Exception {
            mockMvc.perform(get("/api/games/kanji/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void wrongWords_goOnTheList_mostOftenWrongFirst() throws Exception {
            User user = userWith();
            recordKanji(user, kanjiRound("A1", false, "本", "!日", "!月"));
            recordKanji(user, kanjiRound("A1", false, "!月", "人"));

            mockMvc.perform(get("/api/games/kanji/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].word").value("月"))
                    .andExpect(jsonPath("$[0].wrong").value(2))
                    .andExpect(jsonPath("$[0].reading").value("reading of 月"))
                    .andExpect(jsonPath("$[0].meaning").value("meaning of 月"))
                    .andExpect(jsonPath("$[1].word").value("日"))
                    .andExpect(jsonPath("$[1].wrong").value(1));
        }

        @Test
        void twoRightInARow_takeAWordOff() throws Exception {
            User user = userWith();
            recordKanji(user, kanjiRound("A1", false, "!日"));
            recordKanji(user, kanjiRound("A1", false, "日"));

            mockMvc.perform(get("/api/games/kanji/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].rightInRow").value(1));

            recordKanji(user, kanjiRound("B1", false, "日"));

            mockMvc.perform(get("/api/games/kanji/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void wrongAgain_startsCountingAgain() throws Exception {
            User user = userWith();
            recordKanji(user, kanjiRound("A1", false, "!日"));
            recordKanji(user, kanjiRound("A1", false, "日"));
            recordKanji(user, kanjiRound("A1", false, "!日"));
            recordKanji(user, kanjiRound("A1", false, "日"));

            mockMvc.perform(get("/api/games/kanji/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].wrong").value(2))
                    .andExpect(jsonPath("$[0].rightInRow").value(1));
        }

        @Test
        void practiceRound_changesOnlyTheList() throws Exception {
            User user = userWith();
            recordKanji(user, kanjiRound("A1", false, "!日", "!月"));

            mockMvc.perform(post("/api/games/kanji/result")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanjiRound(null, true, "日", "!月"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rounds").value(1))
                    .andExpect(jsonPath("$.askedWords").value(2))
                    .andExpect(jsonPath("$.rightWords").value(0));

            mockMvc.perform(get("/api/games/kanji/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].word").value("月"))
                    .andExpect(jsonPath("$[0].wrong").value(2))
                    .andExpect(jsonPath("$[1].word").value("日"))
                    .andExpect(jsonPath("$[1].rightInRow").value(1));
        }

        @Test
        void wordsNotMatchingTheAnswers_return400() throws Exception {
            KanjiResultRequest round = kanjiRound("A1", false, "日", "月");
            KanjiResultRequest result = new KanjiResultRequest(round.level(), List.of(true), round.words(), round.practice());
            mockMvc.perform(post("/api/games/kanji/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(result)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A round must have as many words as answers"));
        }

        @Test
        void tooLongWord_returns400() throws Exception {
            mockMvc.perform(post("/api/games/kanji/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanjiRound("A1", false, "日".repeat(21)))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Words must have 1 to 20 characters, readings at most 60 and meanings at most 200"));
        }

        @Test
        void delete_takesTheWordOffOnlyForTheCaller() throws Exception {
            User user = userWith();
            User other = userWith();
            recordKanji(user, kanjiRound("A1", false, "!日", "!月"));
            recordKanji(other, kanjiRound("A1", false, "!日"));

            mockMvc.perform(delete("/api/games/kanji/mistakes")
                            .param("word", "日")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].word").value("月"));

            mockMvc.perform(delete("/api/games/kanji/mistakes")
                            .param("word", "本")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));

            mockMvc.perform(get("/api/games/kanji/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(other)))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].word").value("日"));
        }
    }

    /** A round with the given characters; one starting with "!" was read wrong, like "!し". */
    private static KanaResultRequest kanaRound(boolean practice, String... kana) {
        return new KanaResultRequest(Arrays.stream(kana).map(k -> !k.startsWith("!")).toList(),
                Arrays.stream(kana).map(k -> k.replace("!", "")).toList(), practice);
    }

    private void recordKana(User user, KanaResultRequest result) throws Exception {
        mockMvc.perform(post("/api/games/kana/result")
                        .header(HttpHeaders.AUTHORIZATION, bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(result)))
                .andExpect(status().isOk());
    }

    @Nested
    class GetKanaStats {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/games/kana/stats"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutRounds_returnsZeros() throws Exception {
            mockMvc.perform(get("/api/games/kana/stats")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rounds").value(0))
                    .andExpect(jsonPath("$.perfectRounds").value(0))
                    .andExpect(jsonPath("$.rightKana").value(0))
                    .andExpect(jsonPath("$.askedKana").value(0))
                    .andExpect(jsonPath("$.currentStreak").value(0))
                    .andExpect(jsonPath("$.bestStreak").value(0))
                    .andExpect(jsonPath("$.scripts", hasSize(0)));
        }

        @Test
        void returnsOnlyTheNumbersOfTheCaller() throws Exception {
            User user = userWith();
            User other = userWith();
            recordKana(other, kanaRound(false, "あ", "!い"));

            mockMvc.perform(get("/api/games/kana/stats")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rounds").value(0))
                    .andExpect(jsonPath("$.scripts", hasSize(0)));
        }
    }

    @Nested
    class RecordKanaResult {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(post("/api/games/kana/result")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanaRound(false, "あ"))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void characters_countPerScript() throws Exception {
            User user = userWith();
            recordKana(user, kanaRound(false, "あ", "きゃ", "ア"));

            mockMvc.perform(post("/api/games/kana/result")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanaRound(false, "!し", "シャ", "!ヅ"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rounds").value(2))
                    .andExpect(jsonPath("$.perfectRounds").value(1))
                    .andExpect(jsonPath("$.rightKana").value(4))
                    .andExpect(jsonPath("$.askedKana").value(6))
                    .andExpect(jsonPath("$.scripts", hasSize(2)))
                    .andExpect(jsonPath("$.scripts[0].script").value("hiragana"))
                    .andExpect(jsonPath("$.scripts[0].rightKana").value(2))
                    .andExpect(jsonPath("$.scripts[0].askedKana").value(3))
                    .andExpect(jsonPath("$.scripts[1].script").value("katakana"))
                    .andExpect(jsonPath("$.scripts[1].rightKana").value(2))
                    .andExpect(jsonPath("$.scripts[1].askedKana").value(3));
        }

        @Test
        void streak_goesOnAcrossRoundsUntilAWrongCharacter() throws Exception {
            User user = userWith();
            recordKana(user, kanaRound(false, "!あ", "い", "う"));

            mockMvc.perform(post("/api/games/kana/result")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanaRound(false, "え", "お", "!か", "き"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.currentStreak").value(1))
                    .andExpect(jsonPath("$.bestStreak").value(4));
        }

        @Test
        void noAnswers_returns400() throws Exception {
            mockMvc.perform(post("/api/games/kana/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanaRound(false))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A round must have 1 to 20 answers"));
        }

        @Test
        void tooManyAnswers_returns400() throws Exception {
            String[] kana = new String[21];
            Arrays.fill(kana, "あ");
            mockMvc.perform(post("/api/games/kana/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanaRound(false, kana))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A round must have 1 to 20 answers"));
        }

        @Test
        void charactersNotMatchingTheAnswers_return400() throws Exception {
            KanaResultRequest round = kanaRound(false, "あ", "い");
            KanaResultRequest result = new KanaResultRequest(List.of(true), round.kana(), round.practice());
            mockMvc.perform(post("/api/games/kana/result")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(result)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A round must have as many characters as answers"));
        }

        @Test
        void somethingElseThanAKanaCharacter_returns400() throws Exception {
            for (String notKana : List.of("a", "本", "あい", "あア", "きゃゃ", "")) {
                mockMvc.perform(post("/api/games/kana/result")
                                .header(HttpHeaders.AUTHORIZATION, bearerWith())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json(kanaRound(false, notKana))))
                        .andExpect(status().isBadRequest())
                        .andExpect(content().string("Every character must be one hiragana or katakana, maybe with a small ya, yu or yo"));
            }
        }

        @Test
        void deletedAccount_takesItsNumbersWithIt() throws Exception {
            User user = userWith();
            recordKana(user, kanaRound(false, "あ", "!い"));
            assertNotNull(inDatastore(() -> new KanaStatsDAO().get(user.getId())));

            inDatastore(() -> {
                userRepository.deleteAccount(userRepository.getByEmail(user.getEmail()), passwordOf(user));
                return null;
            });

            assertNull(inDatastore(() -> new KanaStatsDAO().get(user.getId())));
        }
    }

    @Nested
    class KanaMistakes {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/games/kana/mistakes"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
            mockMvc.perform(delete("/api/games/kana/mistakes").param("kana", "し"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutRounds_isEmpty() throws Exception {
            mockMvc.perform(get("/api/games/kana/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void wrongCharacters_goOnTheList_mostOftenWrongFirst() throws Exception {
            User user = userWith();
            recordKana(user, kanaRound(false, "あ", "!し", "!ツ"));
            recordKana(user, kanaRound(false, "!ツ", "い"));

            mockMvc.perform(get("/api/games/kana/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].kana").value("ツ"))
                    .andExpect(jsonPath("$[0].wrong").value(2))
                    .andExpect(jsonPath("$[1].kana").value("し"))
                    .andExpect(jsonPath("$[1].wrong").value(1));
        }

        @Test
        void twoRightInARow_takeACharacterOff() throws Exception {
            User user = userWith();
            recordKana(user, kanaRound(false, "!し"));
            recordKana(user, kanaRound(false, "し"));

            mockMvc.perform(get("/api/games/kana/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].rightInRow").value(1));

            recordKana(user, kanaRound(true, "し"));

            mockMvc.perform(get("/api/games/kana/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void wrongAgain_startsCountingAgain() throws Exception {
            User user = userWith();
            recordKana(user, kanaRound(false, "!し"));
            recordKana(user, kanaRound(false, "し"));
            recordKana(user, kanaRound(false, "!し"));
            recordKana(user, kanaRound(false, "し"));

            mockMvc.perform(get("/api/games/kana/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].wrong").value(2))
                    .andExpect(jsonPath("$[0].rightInRow").value(1));
        }

        @Test
        void hiraganaAndKatakana_areDifferentCharacters() throws Exception {
            User user = userWith();
            recordKana(user, kanaRound(false, "!し"));
            recordKana(user, kanaRound(false, "シ", "シ"));

            mockMvc.perform(get("/api/games/kana/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].kana").value("し"))
                    .andExpect(jsonPath("$[0].rightInRow").value(0));
        }

        @Test
        void practiceRound_changesOnlyTheList() throws Exception {
            User user = userWith();
            recordKana(user, kanaRound(false, "!し", "!ち"));

            mockMvc.perform(post("/api/games/kana/result")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(kanaRound(true, "し", "!ち"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rounds").value(1))
                    .andExpect(jsonPath("$.askedKana").value(2))
                    .andExpect(jsonPath("$.rightKana").value(0));

            mockMvc.perform(get("/api/games/kana/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].kana").value("ち"))
                    .andExpect(jsonPath("$[0].wrong").value(2))
                    .andExpect(jsonPath("$[1].kana").value("し"))
                    .andExpect(jsonPath("$[1].rightInRow").value(1));
        }

        @Test
        void delete_takesTheCharacterOffOnlyForTheCaller() throws Exception {
            User user = userWith();
            User other = userWith();
            recordKana(user, kanaRound(false, "!し", "!ち"));
            recordKana(other, kanaRound(false, "!し"));

            mockMvc.perform(delete("/api/games/kana/mistakes")
                            .param("kana", "し")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].kana").value("ち"));

            mockMvc.perform(delete("/api/games/kana/mistakes")
                            .param("kana", "あ")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));

            mockMvc.perform(get("/api/games/kana/mistakes")
                            .header(HttpHeaders.AUTHORIZATION, bearer(other)))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].kana").value("し"));
        }
    }

    /** A round of "Vokabeln"; a word starting with "!" was answered wrong, like "!本". */
    private static VocabResultRequest vocabRound(String level, boolean practice, String... words) {
        return new VocabResultRequest(level,
                Arrays.stream(words).map(word -> !word.startsWith("!")).toList(),
                Arrays.stream(words).map(word -> word.replace("!", ""))
                        .map(word -> new VocabResultRequest.Word(word, "reading of " + word, "meaning of " + word))
                        .toList(),
                practice);
    }

    private void recordVocab(User user, VocabResultRequest result) throws Exception {
        mockMvc.perform(post("/api/games/vocab/result")
                        .header(HttpHeaders.AUTHORIZATION, bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(result)))
                .andExpect(status().isOk());
    }

    @Nested
    class Vocab {

        private static final long DAY = Duration.ofDays(1).toMillis();

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/games/vocab/stats"))
                    .andExpect(status().isUnauthorized());
            mockMvc.perform(get("/api/games/vocab/cards").param("level", "A1"))
                    .andExpect(status().isUnauthorized());
            mockMvc.perform(post("/api/games/vocab/result")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(vocabRound("A1", false, "本"))))
                    .andExpect(status().isUnauthorized());
            mockMvc.perform(get("/api/games/vocab/mistakes"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void withoutRounds_returnsZerosAndNoCards() throws Exception {
            String bearer = bearerWith();
            mockMvc.perform(get("/api/games/vocab/stats").header(HttpHeaders.AUTHORIZATION, bearer))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rounds").value(0))
                    .andExpect(jsonPath("$.levels", hasSize(0)));
            mockMvc.perform(get("/api/games/vocab/cards").param("level", "A1").header(HttpHeaders.AUTHORIZATION, bearer))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void rightWords_goUpABox_wrongOnesBackToTheStart() throws Exception {
            User user = userWith();
            long before = System.currentTimeMillis();
            recordVocab(user, vocabRound("A1", false, "本", "日", "!月"));
            recordVocab(user, vocabRound("A1", false, "本", "!日"));

            mockMvc.perform(get("/api/games/vocab/cards").param("level", "A1").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(3)))
                    .andExpect(jsonPath("$[0].word").value("本"))
                    .andExpect(jsonPath("$[0].box").value(2))
                    .andExpect(jsonPath("$[0].dueAt").value(greaterThanOrEqualTo(before + 2 * DAY)))
                    .andExpect(jsonPath("$[0].dueAt").value(lessThan(before + 3 * DAY)))
                    .andExpect(jsonPath("$[1].word").value("日"))
                    .andExpect(jsonPath("$[1].box").value(0))
                    .andExpect(jsonPath("$[1].dueAt").value(lessThan(before + 2 * DAY)))
                    .andExpect(jsonPath("$[2].word").value("月"))
                    .andExpect(jsonPath("$[2].box").value(0));

            mockMvc.perform(get("/api/games/vocab/cards").param("level", "A2").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void aWordStaysInTheLastBox() throws Exception {
            User user = userWith();
            for (int i = 0; i <= VocabStatsRepository.MAX_BOX; i++) {
                recordVocab(user, vocabRound("A1", false, "本"));
            }

            mockMvc.perform(get("/api/games/vocab/cards").param("level", "A1").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$[0].box").value(VocabStatsRepository.MAX_BOX));
        }

        @Test
        void stats_countRoundsAndLearnedWordsPerLevel() throws Exception {
            User user = userWith();
            for (int i = 0; i < VocabStatsRepository.LEARNED_BOX; i++) {
                recordVocab(user, vocabRound("B1", false, "本"));
            }
            recordVocab(user, vocabRound("B1", false, "!日"));

            mockMvc.perform(get("/api/games/vocab/stats").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rounds").value(VocabStatsRepository.LEARNED_BOX + 1))
                    .andExpect(jsonPath("$.perfectRounds").value(VocabStatsRepository.LEARNED_BOX))
                    .andExpect(jsonPath("$.rightWords").value(VocabStatsRepository.LEARNED_BOX))
                    .andExpect(jsonPath("$.askedWords").value(VocabStatsRepository.LEARNED_BOX + 1))
                    .andExpect(jsonPath("$.currentStreak").value(0))
                    .andExpect(jsonPath("$.bestStreak").value(VocabStatsRepository.LEARNED_BOX))
                    .andExpect(jsonPath("$.levels", hasSize(1)))
                    .andExpect(jsonPath("$.levels[0].level").value("B1"))
                    .andExpect(jsonPath("$.levels[0].words").value(2))
                    .andExpect(jsonPath("$.levels[0].learned").value(1));
        }

        @Test
        void wrongWords_goOnTheListOfMistakes_andCanBeTakenOff() throws Exception {
            User user = userWith();
            recordVocab(user, vocabRound("A1", false, "本", "!日", "!月"));
            recordVocab(user, vocabRound("A1", false, "!月"));

            mockMvc.perform(get("/api/games/vocab/mistakes").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].word").value("月"))
                    .andExpect(jsonPath("$[0].wrong").value(2))
                    .andExpect(jsonPath("$[0].reading").value("reading of 月"))
                    .andExpect(jsonPath("$[0].meaning").value("meaning of 月"));

            mockMvc.perform(delete("/api/games/vocab/mistakes").param("word", "月").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].word").value("日"));
        }

        @Test
        void practiceRound_changesOnlyTheListOfMistakes() throws Exception {
            User user = userWith();
            recordVocab(user, vocabRound("A1", false, "!日"));
            recordVocab(user, vocabRound(null, true, "日", "!月"));

            mockMvc.perform(get("/api/games/vocab/stats").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$.rounds").value(1))
                    .andExpect(jsonPath("$.askedWords").value(1));
            mockMvc.perform(get("/api/games/vocab/cards").param("level", "A1").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].box").value(0));
            mockMvc.perform(get("/api/games/vocab/mistakes").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(2)));
        }

        @Test
        void unknownLevelOrMissingWords_returns400() throws Exception {
            String bearer = bearerWith();
            mockMvc.perform(post("/api/games/vocab/result")
                            .header(HttpHeaders.AUTHORIZATION, bearer)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(vocabRound("D1", false, "本"))))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(post("/api/games/vocab/result")
                            .header(HttpHeaders.AUTHORIZATION, bearer)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new VocabResultRequest("A1", List.of(true), null, false))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A round must have as many words as answers"));
            mockMvc.perform(get("/api/games/vocab/cards").param("level", "D1").header(HttpHeaders.AUTHORIZATION, bearer))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void deletedAccount_takesItsBoxesWithIt() throws Exception {
            User user = userWith();
            recordVocab(user, vocabRound("A1", false, "本"));
            recordVocab(user, vocabRound("C1", false, "!日"));

            inDatastore(() -> {
                userRepository.deleteAccount(userRepository.getByEmail(user.getEmail()), passwordOf(user));
                return null;
            });

            assertNull(inDatastore(() -> new VocabStatsDAO().get(user.getId())));
            assertNull(inDatastore(() -> new VocabProgressDAO().get(VocabProgress.idOf(user.getId(), "A1"))));
            assertNull(inDatastore(() -> new VocabProgressDAO().get(VocabProgress.idOf(user.getId(), "C1"))));
        }
    }

    /** userWith() registers "userN@example.com" with the password "password-N". */
    private static String passwordOf(User user) {
        return "password-" + user.getEmail().replaceAll("\\D", "");
    }
}
