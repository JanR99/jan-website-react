package de.jan.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.googlecode.objectify.ObjectifyService;
import de.jan.controller.requests.RecipeRequest;
import de.jan.image.ImageRepository;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeSeedMarkerDAO;
import de.jan.recipe.RecipeTag;
import de.jan.recipe.repository.RecipeRepository;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * On startup:
 * 1. imports the recipes of resources/recipes/recipes.json whose title is not in the database yet,
 *    until all of them are there; then a RecipeSeedMarker is stored and the import never runs again
 *    (so an interrupted import continues on the next start, and recipes deleted later don't come back),
 * 2. deletes uploaded images that were never saved with a recipe.
 * <p>
 * Runs in afterSingletonsInstantiated, i.e. before the web server accepts requests: Cloud Run gives
 * the instance full CPU while it starts, but throttles it between requests once it is running.
 */
@Configuration
public class RecipeBootstrapConfig implements SmartInitializingSingleton {

    private static final String SEED_FILE = "recipes/recipes.json";
    private static final String SEED_IMAGE_DIR = "recipes/images/";

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SeedRecipe(
            String title,
            String image,
            Integer defaultPortions,
            String cuisine,
            List<RecipeTag> tags,
            List<String> ingredients,
            List<String> preparation,
            List<String> relatedRecipes
    ) {
    }

    private final RecipeRepository recipeRepository;
    private final ImageRepository imageRepository;
    private final ObjectMapper objectMapper;
    private final RecipeSeedMarkerDAO seedMarkerDAO = new RecipeSeedMarkerDAO();

    public RecipeBootstrapConfig(RecipeRepository recipeRepository, ImageRepository imageRepository,
                                 ObjectMapper objectMapper) {
        this.recipeRepository = recipeRepository;
        this.imageRepository = imageRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterSingletonsInstantiated() {
        ObjectifyService.run(() -> {
            try {
                if (!seedMarkerDAO.isCompleted()) {
                    importSeed();
                }
            } catch (Exception e) {
                System.out.println("Bootstrap: recipe import failed: " + e.getMessage());
            }
            try {
                deleteOrphanImages();
            } catch (Exception e) {
                System.out.println("Bootstrap: image cleanup failed: " + e.getMessage());
            }
            return null;
        });
    }

    private void importSeed() throws Exception {
        ClassPathResource resource = new ClassPathResource(SEED_FILE);
        if (!resource.exists()) {
            System.out.println("Bootstrap: no " + SEED_FILE + " found, skipping recipe import.");
            return;
        }

        List<SeedRecipe> seeds;
        try (InputStream in = resource.getInputStream()) {
            seeds = objectMapper.readValue(in, new TypeReference<>() {});
        }

        // loaded once; every created recipe is added, so the title check needs no further reads
        List<Recipe> existing = new ArrayList<>(recipeRepository.getAll());
        Map<String, Recipe> bySlug = new HashMap<>();
        for (Recipe recipe : existing) {
            bySlug.put(RecipeRepository.slug(recipe.getTitle()), recipe);
        }

        // first pass: create the recipes that are missing
        List<SeedRecipe> created = new ArrayList<>();
        int failed = 0;
        for (SeedRecipe seed : seeds) {
            if (seed.title() == null || bySlug.containsKey(RecipeRepository.slug(seed.title().trim()))) {
                continue;
            }

            String image;
            try {
                image = importSeedImage(seed.image());
            } catch (Exception e) {
                System.out.println("Bootstrap: skipped recipe \"" + seed.title() + "\": image " + seed.image() + ": " + e.getMessage());
                failed++;
                continue;
            }

            RecipeRequest request = new RecipeRequest(
                    image, seed.title, seed.defaultPortions, seed.cuisine, seed.tags, seed.ingredients, seed.preparation
            );
            try {
                Recipe recipe = recipeRepository.create(request, existing);
                existing.add(recipe);
                bySlug.put(RecipeRepository.slug(recipe.getTitle()), recipe);
                created.add(seed);
            } catch (Exception e) {
                imageRepository.deleteQuietly(image);
                failed++;
                System.out.println("Bootstrap: skipped recipe \"" + seed.title() + "\": " + e.getMessage());
            }
        }

        // second pass: "Passt dazu" of the new recipes, referenced by title, resolved to IDs
        List<Recipe> withRelated = new ArrayList<>();
        for (SeedRecipe seed : created) {
            Recipe recipe = bySlug.get(RecipeRepository.slug(seed.title().trim()));
            if (recipe == null || seed.relatedRecipes() == null || seed.relatedRecipes().isEmpty()) {
                continue;
            }
            for (String relatedTitle : seed.relatedRecipes()) {
                Recipe related = bySlug.get(RecipeRepository.slug(relatedTitle.trim()));
                if (related != null && !related.getId().equals(recipe.getId())) {
                    recipe.getRelatedRecipeIds().add(related.getId());
                }
            }
            withRelated.add(recipe);
        }
        if (!withRelated.isEmpty()) {
            recipeRepository.saveAllUnchecked(withRelated);
        }

        System.out.println("Bootstrap: imported " + created.size() + " recipes, "
                + (seeds.size() - created.size() - failed) + " already existed, " + failed + " failed.");

        // failed recipes are retried on the next start; once everything is there, never again
        if (failed == 0) {
            seedMarkerDAO.markCompleted();
        }
    }

    /** Stores resources/recipes/images/<fileName> as RecipeImage and returns "uploads/<id>". */
    private String importSeedImage(String fileName) throws Exception {
        if (fileName == null || fileName.isBlank() || fileName.contains("/") || fileName.contains("..")) {
            throw new IllegalArgumentException("invalid file name");
        }
        ClassPathResource resource = new ClassPathResource(SEED_IMAGE_DIR + fileName);
        if (!resource.exists()) {
            throw new IllegalArgumentException("file not found");
        }
        try (InputStream in = resource.getInputStream()) {
            return imageRepository.upload(in.readAllBytes());
        }
    }

    private void deleteOrphanImages() {
        Set<Long> referenced = recipeRepository.getAll().stream()
                .map(recipe -> ImageRepository.idOf(recipe.getImage()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        int deleted = imageRepository.deleteOrphans(referenced);
        if (deleted > 0) {
            System.out.println("Bootstrap: deleted " + deleted + " unused uploaded images.");
        }
    }
}
