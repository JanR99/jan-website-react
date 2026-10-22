package de.jan.games.repository;

import de.jan.controller.requests.KanjiResultRequest;
import de.jan.games.KanjiMistakeDTO;
import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class KanjiStatsRepositoryTest extends ControllerTest {

    @Autowired
    private KanjiStatsRepository kanjiStatsRepository;

    /** A round in which every word was read wrong. */
    private static KanjiResultRequest wrongRound(int from, int count) {
        List<KanjiResultRequest.Word> words = new ArrayList<>();
        for (int i = from; i < from + count; i++) {
            KanjiResultRequest.Word word = new KanjiResultRequest.Word("字" + i, "ji", "character " + i);
            words.add(word);
        }
        return new KanjiResultRequest("A1", new ArrayList<>(Collections.nCopies(count, false)), words, false);
    }

    @Test
    void deleteMistake_withoutAnyRound_changesNothing() {
        User user = userWith();

        assertTrue(inDatastore(() -> kanjiStatsRepository.deleteMistake(user, "本")).isEmpty());
    }

    @Test
    void listOfMistakes_keepsTheNewest500() {
        User user = userWith();
        int rounds = KanjiStatsRepository.MAX_MISTAKES / KanjiStatsRepository.MAX_WORDS + 1;
        for (int round = 0; round < rounds; round++) {
            KanjiResultRequest result = wrongRound(round * KanjiStatsRepository.MAX_WORDS, KanjiStatsRepository.MAX_WORDS);
            inDatastore(() -> kanjiStatsRepository.record(user, result));
        }

        List<KanjiMistakeDTO> mistakes = inDatastore(() -> kanjiStatsRepository.getMistakes(user));

        // the oldest ones are dropped, the ones of the last round are there
        assertEquals(KanjiStatsRepository.MAX_MISTAKES, mistakes.size());
        assertTrue(mistakes.stream().anyMatch(mistake -> mistake.word().equals("字" + (rounds * KanjiStatsRepository.MAX_WORDS - 1))));
    }
}
