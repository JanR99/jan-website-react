package de.jan.feedback.repository;

import de.jan.controller.requests.FeedbackRequest;
import de.jan.exceptions.EntityNotFoundException;
import de.jan.exceptions.EntityStateException;
import de.jan.feedback.Feedback;
import de.jan.feedback.FeedbackDAO;
import de.jan.feedback.FeedbackDTO;
import de.jan.mail.FeedbackMailService;
import de.jan.user.User;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.regex.Pattern;

/** Feedback of logged-in users: stored, mailed to the admin, read and resolved under /konto. */
@Component
public class FeedbackRepository {

    public static final int TEXT_MAX_LENGTH = 2000;
    private static final int PAGE_MAX_LENGTH = 300;

    /** a user may send this much feedback within LIMIT_WINDOW */
    public static final int LIMIT_PER_USER = 5;
    private static final Duration LIMIT_WINDOW = Duration.ofHours(1);

    private static final Pattern LINE_BREAK = Pattern.compile("\\r\\n?");
    private static final Pattern EMPTY_LINES = Pattern.compile("\\n{3,}");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    /** open ones first, the newest first within both groups */
    private static final Comparator<Feedback> ORDER = Comparator
            .comparing(Feedback::isDone)
            .thenComparing(Feedback::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));

    private final FeedbackDAO feedbackDAO;
    private final FeedbackMailService feedbackMailService;

    public FeedbackRepository(FeedbackMailService feedbackMailService) {
        this.feedbackDAO = new FeedbackDAO();
        this.feedbackMailService = feedbackMailService;
    }

    /** Stores the feedback of the user and mails it to the admin. */
    public FeedbackDTO submit(User user, FeedbackRequest request) {
        String text = cleanText(request.getText());
        if (text.isEmpty()) {
            throw new EntityStateException("Text must not be empty");
        }
        if (text.length() > TEXT_MAX_LENGTH) {
            throw new EntityStateException("Text must be at most " + TEXT_MAX_LENGTH + " characters long");
        }

        Date now = new Date();
        long since = now.getTime() - LIMIT_WINDOW.toMillis();
        long recent = feedbackDAO.getByUserId(user.getId()).stream()
                .filter(feedback -> feedback.getCreatedAt() != null && feedback.getCreatedAt().getTime() > since)
                .count();
        if (recent >= LIMIT_PER_USER) {
            throw new EntityStateException("Too much feedback, please try again later");
        }

        String name = (collapse(user.getFirstname()) + " " + collapse(user.getLastname())).trim();
        Feedback feedback = feedbackDAO.save(new Feedback(user.getId(), name, user.getEmail(), text, page(request.getPage()), now));
        feedbackMailService.send(feedback);
        return FeedbackDTO.from(feedback);
    }

    /** All feedback: the open ones first, the newest first within both groups. */
    public List<FeedbackDTO> list() {
        return feedbackDAO.getAll().stream().sorted(ORDER).map(FeedbackDTO::from).toList();
    }

    public FeedbackDTO setDone(Long id, boolean done) {
        Feedback feedback = load(id);
        feedback.setDone(done);
        return FeedbackDTO.from(feedbackDAO.save(feedback));
    }

    public void delete(Long id) {
        feedbackDAO.delete(load(id));
    }

    private Feedback load(Long id) {
        Feedback feedback = id == null ? null : feedbackDAO.getById(id);
        if (feedback == null) {
            throw new EntityNotFoundException("Feedback " + id + " not found");
        }
        return feedback;
    }

    /** Keeps the line breaks, at most one empty line between paragraphs. */
    private static String cleanText(String value) {
        if (value == null) {
            return "";
        }
        String text = LINE_BREAK.matcher(value).replaceAll("\n");
        return EMPTY_LINES.matcher(text).replaceAll("\n\n").strip();
    }

    /** Only a path of this website; anything else is dropped rather than refused. */
    private static String page(String value) {
        String page = collapse(value);
        if (!page.startsWith("/") || page.startsWith("//") || page.length() > PAGE_MAX_LENGTH) {
            return "";
        }
        return page;
    }

    private static String collapse(String value) {
        return value == null ? "" : WHITESPACE.matcher(value.trim()).replaceAll(" ");
    }
}
