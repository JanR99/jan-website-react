package de.jan.feedback.repository;

import de.jan.controller.requests.FeedbackRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FeedbackRepositoryTest extends ControllerTest {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Test
    void withoutText_isRejected() {
        User user = userWith();
        FeedbackRequest request = new FeedbackRequest();
        request.setText(null);

        EntityStateException e = assertThrows(EntityStateException.class, () -> inDatastore(() -> feedbackRepository.submit(user, request)));
        assertEquals("Text must not be empty", e.getMessage());
    }
}
