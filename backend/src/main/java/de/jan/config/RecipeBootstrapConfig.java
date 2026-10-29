package de.jan.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import de.jan.controller.requests.RecipeRequest;
import de.jan.image.RecipeImageRepository;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeTag;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.recipe.repository.RecipeSeedMarkerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.stream.Collectors;

/**
 * On startup:
 * 1. imports the recipes of resources/recipes/recipes.json whose title is not in the database yet,
 *    until all of them are there, marked by a RecipeSeedMarker (see SeedImport),
 * 2. deletes uploaded images that were never saved with a recipe.
 */
@Configuration
public class RecipeBootstrapConfig extends SeedImport<RecipeBootstrapConfig.SeedRecipe> {

    private static final Logger log = LoggerFactory.getLogger(RecipeBootstrapConfig.class);

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
    private final RecipeImageRepository recipeImageRepository;
    private final RecipeSeedMarkerRepository seedMarkerRepository;

    @Autowired
    public RecipeBootstrapConfig(RecipeRepository recipeRepository, RecipeImageRepository recipeImageRepository,
                                 RecipeSeedMarkerRepository seedMarkerRepository, ObjectMapper objectMapper) {
        this(recipeRepository, recipeImageRepository, seedMarkerRepository, objectMapper, SEED_FILE, SEED_IMAGE_DIR);
    }

    /** With other seed data on the classpath, for tests. */
    RecipeBootstrapConfig(RecipeRepository recipeRepository, RecipeImageRepository recipeImageRepository,
                          RecipeSeedMarkerRepository seedMarkerRepository, ObjectMapper objectMapper,
                          String seedFile, String seedImageDir) {
        super(objectMapper, new TypeReference<>() {}, seedFile, seedImageDir, "recipe");
        this.recipeRepository = recipeRepository;
        this.recipeImageRepository = recipeImageRepository;
        this.seedMarkerRepository = seedMarkerRepository;
    }

    @Override
    protected boolean isImported() {
        return seedMarkerRepository.isImported();
    }

    @Override
    protected void markImported() {
        seedMarkerRepository.markImported();
    }

    @Override
    protected void afterImport() {
        try {
            deleteOrphanImages();
        } catch (Exception e) {
            log.error("Bootstrap: image cleanup failed: {}", e.getMessage());
        }
    }

    @Override
    protected boolean importSeeds(List<SeedRecipe> seeds) {
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
                log.warn("Bootstrap: skipped recipe \"{}\": image {}: {}", seed.title(), seed.image(), e.getMessage());
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
                recipeImageRepository.deleteQuietly(image);
                failed++;
                log.warn("Bootstrap: skipped recipe \"{}\": {}", seed.title(), e.getMessage());
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

        log.info("Bootstrap: imported {} recipes, {} already existed, {} failed.",
                created.size(), seeds.size() - created.size() - failed, failed);

        // failed recipes are retried on the next start
        return failed == 0;
    }

    /** Stores resources/recipes/images/<fileName> as RecipeImage and returns "uploads/<id>". */
    private String importSeedImage(String fileName) throws Exception {
        return recipeImageRepository.upload(readImage(fileName));
    }

    private void deleteOrphanImages() {
        Set<Long> referenced = recipeRepository.getAll().stream()
                .map(recipe -> RecipeImageRepository.idOf(recipe.getImage()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        int deleted = recipeImageRepository.deleteOrphans(referenced);
        if (deleted > 0) {
            log.info("Bootstrap: deleted {} unused uploaded images.", deleted);
        }
    }
}
