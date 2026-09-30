package de.jan.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.googlecode.objectify.ObjectifyService;
import de.jan.controller.requests.RecipeRequest;
import de.jan.image.ImageRepository;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeTag;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.user.User;
import de.jan.user.UserDAO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

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
 * 1. imports resources/recipes/recipes.json once, if there are no recipes in the database yet
 *    (so a fresh emulator is filled automatically, production only on the very first start),
 * 2. migrates favorites that are still stored as recipe titles to recipe IDs,
 * 3. deletes uploaded images that were never saved with a recipe.
 */
@Configuration
public class RecipeBootstrapConfig {

    private static final String SEED_FILE = "recipes/recipes.json";

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

    @Bean
    public CommandLineRunner bootstrapRecipes(RecipeRepository recipeRepository, ImageRepository imageRepository,
                                              ObjectMapper objectMapper) {
        return args -> ObjectifyService.run(() -> {
            try {
                if (recipeRepository.isEmpty()) {
                    importSeed(recipeRepository, objectMapper);
                }
            } catch (Exception e) {
                System.out.println("Bootstrap: recipe import failed: " + e.getMessage());
            }
            try {
                migrateFavorites(recipeRepository);
            } catch (Exception e) {
                System.out.println("Bootstrap: favorites migration failed: " + e.getMessage());
            }
            try {
                deleteOrphanImages(recipeRepository, imageRepository);
            } catch (Exception e) {
                System.out.println("Bootstrap: image cleanup failed: " + e.getMessage());
            }
            return null;
        });
    }

    private void importSeed(RecipeRepository recipeRepository, ObjectMapper objectMapper) throws Exception {
        ClassPathResource resource = new ClassPathResource(SEED_FILE);
        if (!resource.exists()) {
            System.out.println("Bootstrap: no " + SEED_FILE + " found, skipping recipe import.");
            return;
        }

        List<SeedRecipe> seeds;
        try (InputStream in = resource.getInputStream()) {
            seeds = objectMapper.readValue(in, new TypeReference<>() {});
        }

        // first pass: create all recipes
        Map<String, Recipe> byTitle = new HashMap<>();
        for (SeedRecipe seed : seeds) {
            RecipeRequest request = new RecipeRequest();
            request.setTitle(seed.title());
            request.setImage(seed.image());
            request.setDefaultPortions(seed.defaultPortions());
            request.setCuisine(seed.cuisine());
            request.setTags(seed.tags());
            request.setIngredients(seed.ingredients());
            request.setPreparation(seed.preparation());
            try {
                Recipe created = recipeRepository.create(request);
                byTitle.put(created.getTitle(), created);
            } catch (Exception e) {
                System.out.println("Bootstrap: skipped recipe \"" + seed.title() + "\": " + e.getMessage());
            }
        }

        List<Recipe> withRelated = new ArrayList<>();
        for (SeedRecipe seed : seeds) {
            Recipe recipe = byTitle.get(seed.title());
            if (recipe == null || seed.relatedRecipes() == null || seed.relatedRecipes().isEmpty()) {
                continue;
            }
            for (String relatedTitle : seed.relatedRecipes()) {
                Recipe related = byTitle.get(relatedTitle);
                if (related != null && !related.getId().equals(recipe.getId())) {
                    recipe.getRelatedRecipeIds().add(related.getId());
                }
            }
            withRelated.add(recipe);
        }
        if (!withRelated.isEmpty()) {
            recipeRepository.saveAllUnchecked(withRelated);
        }

        System.out.println("Bootstrap: imported " + byTitle.size() + " of " + seeds.size() + " recipes.");
    }

    private void deleteOrphanImages(RecipeRepository recipeRepository, ImageRepository imageRepository) {
        Set<Long> referenced = recipeRepository.getAll().stream()
                .map(recipe -> ImageRepository.idOf(recipe.getImage()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        int deleted = imageRepository.deleteOrphans(referenced);
        if (deleted > 0) {
            System.out.println("Bootstrap: deleted " + deleted + " unused uploaded images.");
        }
    }

    private void migrateFavorites(RecipeRepository recipeRepository) {
        UserDAO userDAO = new UserDAO();
        List<User> pending = userDAO.getAll().stream()
                .filter(user -> user.getLegacyFavoriteTitles() != null)
                .toList();
        if (pending.isEmpty()) {
            return;
        }

        Map<String, Long> idsByTitle = new HashMap<>();
        for (Recipe recipe : recipeRepository.getAll()) {
            idsByTitle.put(recipe.getTitle(), recipe.getId());
        }

        for (User user : pending) {
            for (String title : user.getLegacyFavoriteTitles()) {
                Long id = idsByTitle.get(title == null ? null : title.trim());
                if (id != null && !user.getFavoriteRecipeIds().contains(id)) {
                    user.getFavoriteRecipeIds().add(id);
                }
            }
            user.clearLegacyFavoriteTitles();
            userDAO.save(user);
        }
        System.out.println("Bootstrap: migrated favorites of " + pending.size() + " users to recipe IDs.");
    }
}
