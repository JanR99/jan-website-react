package de.jan.user;

import de.jan.objectify.BaseDAO;

import java.util.List;
import java.util.Map;

public class UserDAO extends BaseDAO<User> {

    public UserDAO() {
        super(User.class);
    }

    public List<User> getByEmail(String email) {
        return super.findByFilter(Map.of("email", email));
    }
}
