package de.jan.recipe.favorites;

import de.jan.exceptions.EntityNotFoundException;
import de.jan.exceptions.EntityStateException;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.user.User;
import de.jan.user.UserDAO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FavoritesRepository {

    private final UserDAO userDAO;
    private final RecipeRepository recipeRepository;

    public FavoritesRepository(RecipeRepository recipeRepository) {
        this.userDAO = new UserDAO();
        this.recipeRepository = recipeRepository;
    }

    public List<Long> addFavorite(User user, Long recipeId) {
        validateRecipeId(recipeId);
        if (!recipeRepository.exists(recipeId)) {
            throw new EntityNotFoundException("Recipe " + recipeId + " not found");
        }
        List<Long> favorites = user.getFavoriteRecipeIds();
        if (!favorites.contains(recipeId)) {
            favorites.add(recipeId);
            userDAO.save(user);
        }
        return favorites;
    }

    public List<Long> removeFavorite(User user, Long recipeId) {
        validateRecipeId(recipeId);
        if (user.getFavoriteRecipeIds().remove(recipeId)) {
            userDAO.save(user);
        }
        return user.getFavoriteRecipeIds();
    }

    private static void validateRecipeId(Long recipeId) {
        if (recipeId == null) {
            throw new EntityStateException("Recipe id must not be empty");
        }
    }
}
