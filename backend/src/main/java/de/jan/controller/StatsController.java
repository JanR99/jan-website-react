package de.jan.controller;

import de.jan.controller.requests.VisitRequest;
import de.jan.controller.response.StatsResponse;
import de.jan.role.Permission;
import de.jan.security.Authorization;
import de.jan.security.CurrentUser;
import de.jan.stats.repository.StatsRepository;
import de.jan.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * How many visits the website had. Counting a page is public, reading the numbers requires VIEW_STATS.
 */
@Tag(name = "stats")
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsRepository statsRepository;

    private static final String RECORD_VISIT = "recordVisit";
    private static final String GET_STATS = "getStats";

    public StatsController(StatsRepository statsRepository) {
        this.statsRepository = statsRepository;
    }

    @Operation(operationId = RECORD_VISIT)
    @PostMapping("/visit")
    public ResponseEntity<Void> recordVisit(@RequestBody VisitRequest body) {
        statsRepository.record(body);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = GET_STATS)
    @GetMapping
    public ResponseEntity<StatsResponse> getStats(@CurrentUser User user) {
        Authorization.with(user).require(Permission.VIEW_STATS);
        return ResponseEntity.ok(statsRepository.get());
    }
}
