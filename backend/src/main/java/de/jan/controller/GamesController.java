package de.jan.controller;

import de.jan.controller.requests.CrosswordResultRequest;
import de.jan.games.CrosswordStatsDTO;
import de.jan.games.repository.CrosswordStatsRepository;
import de.jan.security.CurrentUser;
import de.jan.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** What the logged-in user has achieved in the games; always the caller's own numbers. */
@Tag(name = "games")
@RestController
@RequestMapping("/api/games")
public class GamesController {

    private static final String GET_CROSSWORD_STATS = "getCrosswordStats";
    private static final String RECORD_CROSSWORD_RESULT = "recordCrosswordResult";

    private final CrosswordStatsRepository crosswordStatsRepository;

    public GamesController(CrosswordStatsRepository crosswordStatsRepository) {
        this.crosswordStatsRepository = crosswordStatsRepository;
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
}
