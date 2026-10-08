package de.jan.feedback;

import java.time.Instant;

public class FeedbackDTO {

    private Long id;
    private String userName;
    private String userEmail;
    private String text;
    private String page;
    private Instant createdAt;
    private boolean done;

    public static FeedbackDTO from(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.id = feedback.getId();
        dto.userName = feedback.getUserName();
        dto.userEmail = feedback.getUserEmail();
        dto.text = feedback.getText();
        dto.page = feedback.getPage();
        dto.createdAt = feedback.getCreatedAt() == null ? null : feedback.getCreatedAt().toInstant();
        dto.done = feedback.isDone();
        return dto;
    }

    public Long getId() { return id; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public String getText() { return text; }
    public String getPage() { return page; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isDone() { return done; }
}
