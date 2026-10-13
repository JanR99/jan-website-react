package de.jan.controller;

import de.jan.controller.requests.CrosswordResultRequest;
import de.jan.controller.requests.KanjiResultRequest;
import de.jan.games.CrosswordStatsDTO;
import de.jan.games.KanjiMistakeDTO;
import de.jan.games.KanjiStatsDTO;
import de.jan.games.repository.CrosswordStatsRepository;
import de.jan.games.repository.KanjiStatsRepository;
import de.jan.security.CurrentUser;
import de.jan.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** What the logged-in user has achieved in the games; always the caller's own numbers. */
@Tag(name = "games")
@RestController
@RequestMapping("/api/games")
public class GamesController {

    private static final String GET_CROSSWORD_STATS = "getCrosswordStats";
    private static final String RECORD_CROSSWORD_RESULT = "recordCrosswordResult";
    private static final String GET_KANJI_STATS = "getKanjiStats";
    private static final String RECORD_KANJI_RESULT = "recordKanjiResult";
    private static final String GET_KANJI_MISTAKES = "getKanjiMistakes";
    private static final String DELETE_KANJI_MISTAKE = "deleteKanjiMistake";

    private final CrosswordStatsRepository crosswordStatsRepository;
    private final KanjiStatsRepository kanjiStatsRepository;

    public GamesController(CrosswordStatsRepository crosswordStatsRepository, KanjiStatsRepository kanjiStatsRepository) {
        this.crosswordStatsRepository = crosswordStatsRepository;
        this.kanjiStatsRepository = kanjiStatsRepository;
    }

    @Operation(operationId = GET_CROSSWORD_STATS)
    @GetMapping("/crossword/stats")
    public ResponseEntity<CrosswordStatsDTO> getCrosswordStats(@CurrentUser User user) {
        return ResponseEntity.ok(crosswordStatsRepository.get(user));
    }

    @Operation(operationId = RECORD_CROSSWORD_RESULT)
    @PostMapping("/crossword/result")
    public ResponseEntity<CrosswordStatsDTO> recordCrosswordResult(
            @CurrentUser User user,
            @RequestBody CrosswordResultRequest result
    ) {
        return ResponseEntity.ok(crosswordStatsRepository.record(user, result));
    }

    @Operation(operationId = GET_KANJI_STATS)
    @GetMapping("/kanji/stats")
    public ResponseEntity<KanjiStatsDTO> getKanjiStats(@CurrentUser User user) {
        return ResponseEntity.ok(kanjiStatsRepository.get(user));
    }

    @Operation(operationId = RECORD_KANJI_RESULT)
    @PostMapping("/kanji/result")
    public ResponseEntity<KanjiStatsDTO> recordKanjiResult(
            @CurrentUser User user,
            @RequestBody KanjiResultRequest result
    ) {
        return ResponseEntity.ok(kanjiStatsRepository.record(user, result));
    }

    @Operation(operationId = GET_KANJI_MISTAKES)
    @GetMapping("/kanji/mistakes")
    public ResponseEntity<List<KanjiMistakeDTO>> getKanjiMistakes(@CurrentUser User user) {
        return ResponseEntity.ok(kanjiStatsRepository.getMistakes(user));
    }

    @Operation(operationId = DELETE_KANJI_MISTAKE)
    @DeleteMapping("/kanji/mistakes")
    public ResponseEntity<List<KanjiMistakeDTO>> deleteKanjiMistake(
            @CurrentUser User user,
            @RequestParam("word") String word
    ) {
        return ResponseEntity.ok(kanjiStatsRepository.deleteMistake(user, word));
    }
}
