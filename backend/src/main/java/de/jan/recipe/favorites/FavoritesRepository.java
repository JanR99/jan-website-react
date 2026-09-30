package de.jan.recipe.favorites;

import de.jan.exceptions.EntityStateException;
import de.jan.user.User;
import de.jan.user.UserDAO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FavoritesRepository {

    private final UserDAO userDAO;

    public FavoritesRepository() {
        this.userDAO = new UserDAO();
    }

    public List<String> addFavorite(User user, String title) {
        String normalizedTitle = validateFavoriteTitle(title);
        List<String> favorites = user.getFavorites();
        if (!favorites.contains(normalizedTitle)) {
            favorites.add(normalizedTitle);
            userDAO.save(user);
        }
        return favorites;
    }

    public List<String> removeFavorite(User user, String title) {
        String normalizedTitle = validateFavoriteTitle(title);
        if (user.getFavorites().remove(normalizedTitle)) {
            userDAO.save(user);
        }
        return user.getFavorites();
    }

    private static String validateFavoriteTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new EntityStateException("Recipe title must not be empty");
        }
        return title.trim();
    }
}
