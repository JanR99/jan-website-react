package de.jan.feedback;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import de.jan.objectify.DatastoreEntity;

import java.util.Date;

/**
 * Feedback a logged-in user sent about the website. Name and e-mail are copied from the account,
 * so the feedback still says who wrote it after the account was deleted.
 */
@Entity
public class Feedback implements DatastoreEntity {

    @Id
    private Long id;

    /** the account that sent it, for the limit per user */
    @Index
    private Long userId;

    private String userName;

    private String userEmail;

    private String text;

    /** the page the user was on, like "/cookbook/Ramen"; empty if not known */
    private String page;

    private Date createdAt;

    /** marked as done by an admin */
    private boolean done;

    public Feedback() {

    }

    public Feedback(Long userId, String userName, String userEmail, String text, String page, Date createdAt) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.text = text;
        this.page = page;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public String getText() { return text; }
    public String getPage() { return page == null ? "" : page; }
    public Date getCreatedAt() { return createdAt; }

    public boolean isDone() { return done; }
    public void setDone(boolean done) { this.done = done; }
}
