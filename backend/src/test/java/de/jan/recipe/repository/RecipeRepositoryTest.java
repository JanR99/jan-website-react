package de.jan.recipe.repository;

import de.jan.controller.requests.RecipeRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.image.ImageRepository;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeDAO;
import de.jan.recipe.RecipeTag;
import de.jan.recipe.favorites.FavoritesRepository;
import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** What the recipe controller tests don't reach: the cache, cleaning up and the limits of a recipe. */
class RecipeRepositoryTest extends ControllerTest {

    // the first bytes are enough for the type check
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 1, 2, 3};

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private FavoritesRepository favoritesRepository;

    private String uploadedImage() {
        return inDatastore(() -> imageRepository.upload(JPEG));
    }

    private RecipeRequest request(String title) {
        return new RecipeRequest(uploadedImage(), title, 2, "deutsch", List.of(RecipeTag.VEGETARIAN),
                List.of("200 g Mehl"), List.of("Alles mischen."));
    }

    private Recipe stored(String title) {
        RecipeRequest request = request(title);
        return inDatastore(() -> recipeRepository.create(request));
    }

    private String rejected(RecipeRequest request) {
        return assertThrows(EntityStateException.class, () -> inDatastore(() -> recipeRepository.create(request))).getMessage();
    }

    @Test
    void list_isCachedForAWhile() {
        Recipe pesto = stored("Pesto");
        assertEquals(1, inDatastore(() -> recipeRepository.getAll()).size());

        // past the repository, so the cache doesn't know about it
        inDatastore(() -> {
            new RecipeDAO().delete(pesto.getId());
            return null;
        });

        assertEquals(1, inDatastore(() -> recipeRepository.getAll()).size());
    }

    @Test
    void update_withAnotherImage_deletesTheOldOne() {
        Recipe pesto = stored("Pesto");
        RecipeRequest update = request("Pesto");

        Recipe updated = inDatastore(() -> recipeRepository.update(pesto.getId(), update));

        assertEquals(update.getImage(), updated.getImage());
        assertNull(inDatastore(() -> imageRepository.getById(ImageRepository.idOf(pesto.getImage()))));
        assertNotNull(inDatastore(() -> imageRepository.getById(ImageRepository.idOf(updated.getImage()))));
    }

    @Test
    void delete_takesTheRecipeOutOfPasstDazuAndTheFavorites() {
        Recipe pesto = stored("Pesto");
        RecipeRequest pastaRequest = request("Pasta");
        pastaRequest.setRelatedRecipeIds(List.of(pesto.getId()));
        Recipe pasta = inDatastore(() -> recipeRepository.create(pastaRequest));
        User fan = userWith();
        inDatastore(() -> favoritesRepository.addFavorite(userRepository.getByEmail(fan.getEmail()), pesto.getId()));

        inDatastore(() -> {
            recipeRepository.delete(pesto.getId());
            return null;
        });

        assertEquals(List.of(), inDatastore(() -> recipeRepository.getById(pasta.getId())).getRelatedRecipeIds());
        assertEquals(List.of(), inDatastore(() -> userRepository.getByEmail(fan.getEmail())).getFavoriteRecipeIds());
    }

    @Test
    void passtDazu_leavesOutEmptyEntriesAndTheRecipeItself_andRejectsUnknownOnes() {
        Recipe pesto = stored("Pesto");
        RecipeRequest itself = request("Pesto");
        itself.setRelatedRecipeIds(Arrays.asList(null, pesto.getId()));

        assertTrue(inDatastore(() -> recipeRepository.update(pesto.getId(), itself)).getRelatedRecipeIds().isEmpty());

        RecipeRequest unknown = request("Pasta");
        unknown.setRelatedRecipeIds(List.of(999_999L));
        assertEquals("Related recipe 999999 does not exist", rejected(unknown));
    }

    @Test
    void portionsOutOfRange_areRejected() {
        RecipeRequest none = request("Pesto");
        none.setDefaultPortions(0);
        RecipeRequest tooMany = request("Pesto");
        tooMany.setDefaultPortions(100);

        assertEquals("Portions must be between 1 and 99", rejected(none));
        assertEquals("Portions must be between 1 and 99", rejected(tooMany));
    }

    @Test
    void tooManyIngredients_areRejected() {
        RecipeRequest request = request("Pesto");
        request.setIngredients(new ArrayList<>(Collections.nCopies(201, "Salz")));

        assertEquals("Ingredients must have at most 200 entries", rejected(request));
    }

    @Test
    void tooLongTitle_isRejected() {
        assertEquals("Title must be at most 150 characters long", rejected(request("P".repeat(151))));
    }
}
