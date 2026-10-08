package de.jan.controller;

import de.jan.controller.requests.FeedbackRequest;
import de.jan.feedback.FeedbackDTO;
import de.jan.feedback.repository.FeedbackRepository;
import de.jan.role.Permission;
import de.jan.security.Authorization;
import de.jan.security.CurrentUser;
import de.jan.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Feedback about the website. Sending requires a login, everything else MANAGE_FEEDBACK.
 */
@Tag(name = "feedback")
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    private static final String SUBMIT_FEEDBACK = "submitFeedback";
    private static final String LIST_FEEDBACK = "listFeedback";
    private static final String SET_FEEDBACK_DONE = "setFeedbackDone";
    private static final String DELETE_FEEDBACK = "deleteFeedback";

    public FeedbackController(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Operation(operationId = SUBMIT_FEEDBACK)
    @PostMapping("/submit")
    public ResponseEntity<FeedbackDTO> submitFeedback(
            @CurrentUser User user,
            @RequestBody FeedbackRequest body
    ) {
        return ResponseEntity.ok(feedbackRepository.submit(user, body));
    }

    @Operation(operationId = LIST_FEEDBACK)
    @GetMapping("/list")
    public ResponseEntity<List<FeedbackDTO>> listFeedback(@CurrentUser User user) {
        Authorization.with(user).require(Permission.MANAGE_FEEDBACK);
        return ResponseEntity.ok(feedbackRepository.list());
    }

    @Operation(operationId = SET_FEEDBACK_DONE)
    @PostMapping("/setDone")
    public ResponseEntity<FeedbackDTO> setFeedbackDone(
            @CurrentUser User user,
            @RequestParam("id") Long id,
            @RequestParam("done") boolean done
    ) {
        Authorization.with(user).require(Permission.MANAGE_FEEDBACK);
        return ResponseEntity.ok(feedbackRepository.setDone(id, done));
    }

    @Operation(operationId = DELETE_FEEDBACK)
    @PostMapping("/delete")
    public ResponseEntity<Void> deleteFeedback(
            @CurrentUser User user,
            @RequestParam("id") Long id
    ) {
        Authorization.with(user).require(Permission.MANAGE_FEEDBACK);
        feedbackRepository.delete(id);
        return ResponseEntity.noContent().build();
    }
}
