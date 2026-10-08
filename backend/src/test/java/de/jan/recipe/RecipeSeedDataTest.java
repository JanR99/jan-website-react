package de.jan.recipe;

import de.jan.config.RecipeBootstrapConfig.SeedRecipe;
import de.jan.image.ImageRepository;
import de.jan.image.ImageType;
import de.jan.recipe.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Checks the seed data in resources/recipes (recipes.json and the images) the way the
 * import on startup needs it. Needs no database.
 */
class RecipeSeedDataTest {

    private static final String SEED_FILE = "/recipes/recipes.json";
    private static final String SEED_IMAGE_DIR = "/recipes/images/";

    private static List<SeedRecipe> seeds;

    @BeforeAll
    static void loadSeeds() throws IOException {
        try (InputStream in = RecipeSeedDataTest.class.getResourceAsStream(SEED_FILE)) {
            assertNotNull(in, SEED_FILE + " is missing");
            // also fails on unknown tags, because they are read into the RecipeTag enum
            seeds = new ObjectMapper().readValue(in, new TypeReference<>() {});
        }
    }

    @Test
    void containsRecipes() {
        assertFalse(seeds.isEmpty(), "recipes.json contains no recipes");
    }

    @Test
    void everyRecipeHasItsRequiredFields() {
        List<String> problems = new ArrayList<>();
        for (SeedRecipe seed : seeds) {
            String name = "\"" + seed.title() + "\"";
            if (isBlank(seed.title())) problems.add("a recipe has no title");
            if (isBlank(seed.cuisine())) problems.add(name + " has no cuisine");
            if (isBlank(seed.image())) problems.add(name + " has no image");
            if (seed.defaultPortions() == null || seed.defaultPortions() < 1 || seed.defaultPortions() > 99) {
                problems.add(name + " has invalid defaultPortions: " + seed.defaultPortions());
            }
            if (hasNoEntries(seed.ingredients())) problems.add(name + " has no ingredients");
            if (hasNoEntries(seed.preparation())) problems.add(name + " has no preparation steps");
        }
        assertNoProblems(problems);
    }

    @Test
    void titlesAreUnique() {
        // the slug is the recipe's URL, so two titles must not end up with the same one
        List<String> problems = new ArrayList<>();
        Set<String> slugs = new HashSet<>();
        for (SeedRecipe seed : seeds) {
            if (!isBlank(seed.title()) && !slugs.add(RecipeRepository.slug(seed.title().trim()))) {
                problems.add("\"" + seed.title() + "\" exists more than once");
            }
        }
        assertNoProblems(problems);
    }

    @Test
    void everyImageExistsAndCanBeStored() throws IOException {
        List<String> problems = new ArrayList<>();
        for (SeedRecipe seed : seeds) {
            if (isBlank(seed.image())) {
                continue; // reported by everyRecipeHasItsRequiredFields
            }
            String name = "\"" + seed.title() + "\": image " + seed.image();
            try (InputStream in = RecipeSeedDataTest.class.getResourceAsStream(SEED_IMAGE_DIR + seed.image())) {
                if (in == null) {
                    problems.add(name + " is missing in resources/recipes/images");
                    continue;
                }
                byte[] data = in.readAllBytes();
                if (data.length > ImageRepository.MAX_SIZE_BYTES) {
                    problems.add(name + " is too large (" + data.length / 1024 + " KB)");
                }
                try {
                    ImageType.detect(data);
                } catch (RuntimeException e) {
                    problems.add(name + " is not a JPEG, PNG or WebP image");
                }
            }
        }
        assertNoProblems(problems);
    }

    @Test
    void relatedRecipesExist() {
        Set<String> titles = new HashSet<>();
        for (SeedRecipe seed : seeds) {
            titles.add(seed.title());
        }
        List<String> problems = new ArrayList<>();
        for (SeedRecipe seed : seeds) {
            if (seed.relatedRecipes() == null) {
                continue;
            }
            for (String related : seed.relatedRecipes()) {
                if (!titles.contains(related)) {
                    problems.add("\"" + seed.title() + "\" refers to unknown recipe \"" + related + "\"");
                }
            }
        }
        assertNoProblems(problems);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static boolean hasNoEntries(List<String> entries) {
        return entries == null || entries.stream().allMatch(RecipeSeedDataTest::isBlank);
    }

    private static void assertNoProblems(List<String> problems) {
        assertTrue(problems.isEmpty(), () -> problems.size() + " problem(s):\n" + String.join("\n", problems));
    }
}
