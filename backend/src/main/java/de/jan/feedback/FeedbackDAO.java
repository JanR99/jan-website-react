package de.jan.feedback;

import de.jan.objectify.BaseDAO;
import de.jan.objectify.Filter;

import java.util.List;

public class FeedbackDAO extends BaseDAO<Feedback, Long> {

    public FeedbackDAO() {
        super(Feedback.class);
    }

    public List<Feedback> getByUserId(Long userId) {
        return find(Filter.eq("userId", userId));
    }
}
