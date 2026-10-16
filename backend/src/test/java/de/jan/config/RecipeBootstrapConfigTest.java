package de.jan.config;

import de.jan.controller.requests.RecipeRequest;
import de.jan.image.ImageRepository;
import de.jan.image.RecipeImage;
import de.jan.image.RecipeImageDAO;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeSeedMarkerDAO;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.testsupport.ControllerTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** The recipe import on startup, with the seed data of src/test/resources/bootstrap and the real images. */
class RecipeBootstrapConfigTest extends ControllerTest {

    private static final String IMAGES = "recipes/images/";

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private ImageRepository imageRepository;

    private void bootstrap(String seedFile) {
        new RecipeBootstrapConfig(recipeRepository, imageRepository, objectMapper, seedFile, IMAGES).afterSingletonsInstantiated();
    }

    private static byte[] image() throws IOException {
        try (InputStream in = new ClassPathResource(IMAGES + "Knoblauchoel.jpg").getInputStream()) {
            return in.readAllBytes();
        }
    }

    private Map<String, Recipe> recipesByTitle() {
        return inDatastore(() -> recipeRepository.getAll()).stream()
                .collect(Collectors.toMap(Recipe::getTitle, Function.identity()));
    }

    private boolean completed() {
        return inDatastore(() -> new RecipeSeedMarkerDAO().isCompleted());
    }

    @Test
    void importsTheMissingRecipes_andTriesTheFailedOnesAgainLater() throws IOException {
        byte[] image = image();
        inDatastore(() -> recipeRepository.create(new RecipeRequest(
                imageRepository.upload(image), "Schon da", 2, "italienisch", List.of(), List.of("Salz"), List.of("Salzen."))));

        bootstrap("bootstrap/recipes.json");

        Map<String, Recipe> recipes = recipesByTitle();
        // without a title, with a wrong or missing image file and without ingredients nothing is created
        assertEquals(List.of("Beilage", "Mit Beilage", "Schon da"), recipes.keySet().stream().sorted().toList());
        // "Passt dazu" by title: itself and unknown titles are left out
        assertEquals(List.of(recipes.get("Beilage").getId()), recipes.get("Mit Beilage").getRelatedRecipeIds());
        assertTrue(recipes.get("Beilage").getRelatedRecipeIds().isEmpty());
        // the image of the recipe that couldn't be created is deleted again
        assertEquals(3, inDatastore(() -> new RecipeImageDAO().getAll()).size());
        assertFalse(completed());
    }

    @Test
    void allImported_marksTheImportDone_soItNeverRunsAgain() {
        bootstrap("bootstrap/recipes-complete.json");
        assertTrue(completed());

        inDatastore(() -> {
            recipeRepository.delete(recipeRepository.getAll().getFirst().getId());
            return null;
        });
        bootstrap("bootstrap/recipes-complete.json");

        assertTrue(recipesByTitle().isEmpty());
    }

    @Test
    void withoutSeedFile_importsNothing() {
        bootstrap("bootstrap/missing.json");

        assertTrue(recipesByTitle().isEmpty());
        assertFalse(completed());
    }

    @Test
    void brokenSeedFile_doesNotStopTheStart() {
        assertDoesNotThrow(() -> bootstrap("bootstrap/broken.json"));

        assertTrue(recipesByTitle().isEmpty());
        assertFalse(completed());
    }

    @Test
    void deletesOldImagesNoRecipeUses() throws IOException {
        RecipeImage old = new RecipeImage(image(), "image/jpeg");
        ReflectionTestUtils.setField(old, "createdAt", new Date(System.currentTimeMillis() - 2L * 24 * 60 * 60 * 1000));
        Long id = inDatastore(() -> new RecipeImageDAO().save(old)).getId();
        assertNotNull(inDatastore(() -> imageRepository.getById(id)).getCreatedAt());

        bootstrap("bootstrap/missing.json");

        assertNull(inDatastore(() -> imageRepository.getById(id)));
    }

    @Test
    void failingCleanup_doesNotStopTheStart() {
        RecipeRepository failing = mock(RecipeRepository.class);
        when(failing.getAll()).thenThrow(new IllegalStateException("database down"));

        assertDoesNotThrow(() -> new RecipeBootstrapConfig(failing, imageRepository, objectMapper, "bootstrap/missing.json", IMAGES)
                .afterSingletonsInstantiated());
    }
}
