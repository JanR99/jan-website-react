package de.jan.user.repository;

import de.jan.exceptions.EntityNotFoundException;
import de.jan.exceptions.EntityStateException;
import de.jan.user.User;
import de.jan.user.UserDAO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserRepository {

    private final UserDAO userDAO;

    public UserRepository() {
        this.userDAO = new UserDAO();
    }

    public User save(User user) {
        if (user.getEmail() == null || user.getPassword() == null) {
            throw new EntityStateException("Email or password is null");
        }
        return userDAO.save(user);
    }

    public User getByEmail(String email) {
        List<User> users = userDAO.getByEmail(email);
        if (users.isEmpty()) {
            throw new EntityNotFoundException("User with email " + email + " not found");
        }
        return users.getFirst();
    }
}