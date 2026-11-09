package de.jan.controller;

import de.jan.controller.requests.CrosswordResultRequest;
import de.jan.controller.requests.KanaResultRequest;
import de.jan.controller.requests.KanjiResultRequest;
import de.jan.controller.requests.VocabResultRequest;
import de.jan.games.*;
import de.jan.games.repository.CrosswordStatsRepository;
import de.jan.games.repository.KanaStatsRepository;
import de.jan.games.repository.KanjiStatsRepository;
import de.jan.games.repository.VocabStatsRepository;
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
    private static final String GET_KANA_STATS = "getKanaStats";
    private static final String RECORD_KANA_RESULT = "recordKanaResult";
    private static final String GET_KANA_MISTAKES = "getKanaMistakes";
    private static final String DELETE_KANA_MISTAKE = "deleteKanaMistake";
    private static final String GET_VOCAB_STATS = "getVocabStats";
    private static final String GET_VOCAB_CARDS = "getVocabCards";
    private static final String RECORD_VOCAB_RESULT = "recordVocabResult";
    private static final String GET_VOCAB_MISTAKES = "getVocabMistakes";
    private static final String DELETE_VOCAB_MISTAKE = "deleteVocabMistake";

    private final CrosswordStatsRepository crosswordStatsRepository;
    private final KanjiStatsRepository kanjiStatsRepository;
    private final KanaStatsRepository kanaStatsRepository;
    private final VocabStatsRepository vocabStatsRepository;

    public GamesController(CrosswordStatsRepository crosswordStatsRepository, KanjiStatsRepository kanjiStatsRepository,
                           KanaStatsRepository kanaStatsRepository, VocabStatsRepository vocabStatsRepository) {
        this.crosswordStatsRepository = crosswordStatsRepository;
        this.kanjiStatsRepository = kanjiStatsRepository;
        this.kanaStatsRepository = kanaStatsRepository;
        this.vocabStatsRepository = vocabStatsRepository;
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

    @Operation(operationId = GET_KANA_STATS)
    @GetMapping("/kana/stats")
    public ResponseEntity<KanaStatsDTO> getKanaStats(@CurrentUser User user) {
        return ResponseEntity.ok(kanaStatsRepository.get(user));
    }

    @Operation(operationId = RECORD_KANA_RESULT)
    @PostMapping("/kana/result")
    public ResponseEntity<KanaStatsDTO> recordKanaResult(
            @CurrentUser User user,
            @RequestBody KanaResultRequest result
    ) {
        return ResponseEntity.ok(kanaStatsRepository.record(user, result));
    }

    @Operation(operationId = GET_KANA_MISTAKES)
    @GetMapping("/kana/mistakes")
    public ResponseEntity<List<KanaMistakeDTO>> getKanaMistakes(@CurrentUser User user) {
        return ResponseEntity.ok(kanaStatsRepository.getMistakes(user));
    }

    @Operation(operationId = DELETE_KANA_MISTAKE)
    @DeleteMapping("/kana/mistakes")
    public ResponseEntity<List<KanaMistakeDTO>> deleteKanaMistake(
            @CurrentUser User user,
            @RequestParam("kana") String kana
    ) {
        return ResponseEntity.ok(kanaStatsRepository.deleteMistake(user, kana));
    }

    @Operation(operationId = GET_VOCAB_STATS)
    @GetMapping("/vocab/stats")
    public ResponseEntity<VocabStatsDTO> getVocabStats(@CurrentUser User user) {
        return ResponseEntity.ok(vocabStatsRepository.get(user));
    }

    @Operation(operationId = GET_VOCAB_CARDS)
    @GetMapping("/vocab/cards")
    public ResponseEntity<List<VocabCardDTO>> getVocabCards(
            @CurrentUser User user,
            @RequestParam("level") String level
    ) {
        return ResponseEntity.ok(vocabStatsRepository.getCards(user, level));
    }

    @Operation(operationId = RECORD_VOCAB_RESULT)
    @PostMapping("/vocab/result")
    public ResponseEntity<VocabStatsDTO> recordVocabResult(
            @CurrentUser User user,
            @RequestBody VocabResultRequest result
    ) {
        return ResponseEntity.ok(vocabStatsRepository.record(user, result));
    }

    @Operation(operationId = GET_VOCAB_MISTAKES)
    @GetMapping("/vocab/mistakes")
    public ResponseEntity<List<VocabMistakeDTO>> getVocabMistakes(@CurrentUser User user) {
        return ResponseEntity.ok(vocabStatsRepository.getMistakes(user));
    }

    @Operation(operationId = DELETE_VOCAB_MISTAKE)
    @DeleteMapping("/vocab/mistakes")
    public ResponseEntity<List<VocabMistakeDTO>> deleteVocabMistake(
            @CurrentUser User user,
            @RequestParam("word") String word
    ) {
        return ResponseEntity.ok(vocabStatsRepository.deleteMistake(user, word));
    }
}
