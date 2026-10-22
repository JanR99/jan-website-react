package de.jan.feedback;

import java.time.Instant;

public record FeedbackDTO(Long id, String userName, String userEmail, String text, String page, Instant createdAt,
                          boolean done) {

    public static FeedbackDTO from(Feedback feedback) {
        return new FeedbackDTO(feedback.getId(), feedback.getUserName(), feedback.getUserEmail(), feedback.getText(),
                feedback.getPage(), feedback.getCreatedAt() == null ? null : feedback.getCreatedAt().toInstant(),
                feedback.isDone());
    }
}
