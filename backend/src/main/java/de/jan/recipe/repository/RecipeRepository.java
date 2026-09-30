package de.jan.recipe.repository;

import de.jan.controller.requests.RecipeRequest;
import de.jan.exceptions.EntityNotFoundException;
import de.jan.exceptions.EntityStateException;
import de.jan.image.ImageRepository;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeDAO;
import de.jan.recipe.RecipeTag;
import de.jan.user.User;
import de.jan.user.UserDAO;
import org.springframework.stereotype.Component;

import java.text.Collator;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class RecipeRepository {

    /**
     * The list is read on every page load, so it is cached for a short time to save Datastore reads.
     * Writes on this instance clear it right away; other Cloud Run instances catch up after the TTL.
     */
    private static final Duration CACHE_TTL = Duration.ofSeconds(60);

    private static final int TITLE_MAX_LENGTH = 150;
    private static final int SHORT_TEXT_MAX_LENGTH = 200;
    private static final int ENTRY_MAX_LENGTH = 2000;
    private static final int MAX_ENTRIES = 200;
    private static final int MAX_PORTIONS = 99;
    private static final Pattern LINE_BREAKS = Pattern.compile("\\s*\\R\\s*");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private final RecipeDAO recipeDAO;
    private final UserDAO userDAO;
    private final ImageRepository imageRepository;

    private volatile List<Recipe> cache;
    private volatile long cachedAt;

    public RecipeRepository(ImageRepository imageRepository) {
        this.recipeDAO = new RecipeDAO();
        this.userDAO = new UserDAO();
        this.imageRepository = imageRepository;
    }

    public List<Recipe> getAll() {
        List<Recipe> current = cache;
        if (current != null && System.currentTimeMillis() - cachedAt < CACHE_TTL.toMillis()) {
            return current;
        }
        Collator collator = Collator.getInstance(Locale.GERMAN);
        List<Recipe> loaded = new ArrayList<>(recipeDAO.getAll());
        loaded.sort(Comparator.comparing(Recipe::getTitle, collator));
        List<Recipe> result = List.copyOf(loaded);
        cache = result;
        cachedAt = System.currentTimeMillis();
        return result;
    }

    public Recipe getById(Long id) {
        Recipe recipe = id == null ? null : recipeDAO.getById(id);
        if (recipe == null) {
            throw new EntityNotFoundException("Recipe " + id + " not found");
        }
        return recipe;
    }

    public boolean exists(Long id) {
        return recipeDAO.exists(id);
    }

    public boolean isEmpty() {
        return recipeDAO.count() == 0;
    }

    public Recipe create(RecipeRequest request) {
        Recipe recipe = new Recipe();
        apply(recipe, request);
        Recipe saved = recipeDAO.save(recipe);
        invalidateCache();
        return saved;
    }

    public Recipe update(Long id, RecipeRequest request) {
        Recipe recipe = getById(id);
        String previousImage = recipe.getImage();
        apply(recipe, request);
        Recipe saved = recipeDAO.save(recipe);
        invalidateCache();
        if (!Objects.equals(previousImage, saved.getImage())) {
            imageRepository.deleteQuietly(previousImage);
        }
        return saved;
    }

    public void delete(Long id) {
        Recipe recipe = getById(id);

        List<Recipe> referencing = recipeDAO.getAll().stream()
                .filter(other -> other.getRelatedRecipeIds().remove(id))
                .toList();
        if (!referencing.isEmpty()) {
            recipeDAO.saveAll(referencing);
        }

        for (User user : userDAO.getByFavoriteRecipeId(id)) {
            user.getFavoriteRecipeIds().remove(id);
            userDAO.save(user);
        }

        recipeDAO.delete(recipe);
        invalidateCache();
        imageRepository.deleteQuietly(recipe.getImage());
    }

    public void saveAllUnchecked(List<Recipe> recipes) {
        recipeDAO.saveAll(recipes);
        invalidateCache();
    }

    private void invalidateCache() {
        cache = null;
    }

    private void apply(Recipe recipe, RecipeRequest request) {
        String title = collapse(request.getTitle());
        requireText(title, "Title", TITLE_MAX_LENGTH);
        String slug = slug(title);
        boolean duplicate = recipeDAO.getAll().stream()
                .anyMatch(other -> !Objects.equals(other.getId(), recipe.getId()) && slug(other.getTitle()).equals(slug));
        if (duplicate) {
            throw new EntityStateException("A recipe with this title already exists");
        }

        String image = request.getImage() == null ? "" : request.getImage().trim();
        requireText(image, "Image", SHORT_TEXT_MAX_LENGTH);
        // a new upload must exist; keeping the current image needs no check
        if (!image.equals(recipe.getImage()) && !imageRepository.isValidUpload(image)) {
            throw new EntityStateException("The uploaded image was not found, please upload it again");
        }

        Integer portions = request.getDefaultPortions();
        if (portions == null || portions < 1 || portions > MAX_PORTIONS) {
            throw new EntityStateException("Portions must be between 1 and " + MAX_PORTIONS);
        }

        String cuisine = collapse(request.getCuisine()).toLowerCase(Locale.GERMAN);
        requireText(cuisine, "Cuisine", SHORT_TEXT_MAX_LENGTH);

        List<String> ingredients = cleanEntries(request.getIngredients(), "Ingredients");
        List<String> preparation = cleanEntries(request.getPreparation(), "Preparation");

        // unknown tag names are already rejected by Jackson when reading the request
        Set<RecipeTag> tags = new LinkedHashSet<>();
        if (request.getTags() != null) {
            request.getTags().stream().filter(Objects::nonNull).forEach(tags::add);
        }

        Set<Long> related = new LinkedHashSet<>();
        if (request.getRelatedRecipeIds() != null) {
            for (Long relatedId : request.getRelatedRecipeIds()) {
                if (relatedId == null || relatedId.equals(recipe.getId())) {
                    continue;
                }
                if (!exists(relatedId)) {
                    throw new EntityStateException("Related recipe " + relatedId + " does not exist");
                }
                related.add(relatedId);
            }
        }

        recipe.setTitle(title);
        recipe.setImage(image);
        recipe.setDefaultPortions(portions);
        recipe.setCuisine(cuisine);
        recipe.setTags(new ArrayList<>(tags));
        recipe.setIngredients(ingredients);
        recipe.setPreparation(preparation);
        recipe.setRelatedRecipeIds(new ArrayList<>(related));
    }

    public static List<String> cleanEntries(List<String> entries, String label) {
        List<String> cleaned = new ArrayList<>();
        if (entries != null) {
            for (String entry : entries) {
                String value = entry == null ? "" : LINE_BREAKS.matcher(entry.trim()).replaceAll(" ");
                if (!value.isEmpty()) {
                    requireText(value, label, ENTRY_MAX_LENGTH);
                    cleaned.add(value);
                }
            }
        }
        if (cleaned.isEmpty()) {
            throw new EntityStateException(label + " must not be empty");
        }
        if (cleaned.size() > MAX_ENTRIES) {
            throw new EntityStateException(label + " must have at most " + MAX_ENTRIES + " entries");
        }
        return cleaned;
    }

    public static String slug(String title) {
        return WHITESPACE.matcher(title.toLowerCase(Locale.ROOT)).replaceAll("-");
    }

    private static String collapse(String value) {
        return value == null ? "" : WHITESPACE.matcher(value.trim()).replaceAll(" ");
    }

    private static void requireText(String value, String label, int maxLength) {
        if (value.isEmpty()) {
            throw new EntityStateException(label + " must not be empty");
        }
        if (value.length() > maxLength) {
            throw new EntityStateException(label + " must be at most " + maxLength + " characters long");
        }
    }
}
