package de.jan.backup;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.jan.backup.BackupRepository.FolderBackup;
import de.jan.backup.BackupRepository.RecipeBackup;
import de.jan.controller.requests.RecipeRequest;
import de.jan.controller.requests.TravelFolderRequest;
import de.jan.controller.requests.TravelStopRequest;
import de.jan.controller.response.RestoreResponse;
import de.jan.exceptions.EntityStateException;
import de.jan.exceptions.UnauthorizedException;
import de.jan.image.ImageRepository;
import de.jan.objectify.BaseDAO;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeSeedMarkerDAO;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.repository.TravelRepository;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;

/**
 * Puts a backup of the BackupRepository back into the database: all recipes and travel folders are
 * deleted and replaced by the ones of the ZIP file, so a local database can be brought to the state of
 * the website. The recipes and photos get new ids; users, roles and feedback stay as they are.
 *
 * Only on a local machine, never on Cloud Run: there it would overwrite the real data.
 */
@Component
public class RestoreRepository {

    public static final String ONLY_LOCAL = "A backup can only be restored on a local machine";

    /** A restored recipe with the titles of its "Passt dazu" recipes, which are resolved once all recipes exist. */
    private record RestoredRecipe(Recipe recipe, List<String> relatedTitles) {
    }

    /** A restored folder with the name of the folder its trip came from, which is resolved once all folders exist. */
    private record RestoredFolder(Long id, TravelFolderRequest request, String previousFolder) {
    }

    private final RecipeRepository recipeRepository;
    private final ImageRepository imageRepository;
    private final TravelRepository travelRepository;
    private final ObjectMapper objectMapper;
    private final RecipeSeedMarkerDAO recipeSeedMarkerDAO = new RecipeSeedMarkerDAO();

    /** Cloud Run always sets K_SERVICE. Not final, so the tests can switch it. */
    private boolean onCloudRun = System.getenv("K_SERVICE") != null;

    public RestoreRepository(RecipeRepository recipeRepository, ImageRepository imageRepository,
                             TravelRepository travelRepository, ObjectMapper objectMapper) {
        this.recipeRepository = recipeRepository;
        this.imageRepository = imageRepository;
        this.travelRepository = travelRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Replaces all recipes and travel folders by the ones of the backup. Nothing is deleted before the
     * file has turned out to be a backup. A recipe, folder or photo the database does not accept is
     * left out and named in the answer; the rest is restored.
     *
     * @param in the ZIP file; it is not closed
     */
    public RestoreResponse restore(InputStream in) throws IOException {
        if (onCloudRun) {
            throw new UnauthorizedException(ONLY_LOCAL);
        }
        // as a file and not from the stream: the images come before the lists that say where they belong
        Path file = Files.createTempFile("jan-website-restore-", ".zip");
        try {
            Files.copy(in, file, StandardCopyOption.REPLACE_EXISTING);
            try (ZipFile zip = open(file)) {
                List<RecipeBackup> recipes = readList(zip, BackupRepository.RECIPES_FILE, RecipeBackup.class);
                List<FolderBackup> folders = readList(zip, BackupRepository.FOLDERS_FILE, FolderBackup.class);

                recipeRepository.deleteAll();
                travelRepository.deleteAllFolders();
                // what is restored takes the place of the seed data, also if that was never fully imported
                recipeSeedMarkerDAO.markCompleted();
                travelRepository.markSeedImported();

                RestoreResponse result = new RestoreResponse();
                restoreRecipes(zip, recipes, result);
                restoreFolders(zip, folders, result);
                System.out.println("Restore: " + result.getRecipes() + " recipes, " + result.getFolders()
                        + " travel folders and " + result.getPhotos() + " travel photos restored.");
                return result;
            }
        } finally {
            Files.deleteIfExists(file);
        }
    }

    private void restoreRecipes(ZipFile zip, List<RecipeBackup> backups, RestoreResponse result) throws IOException {
        // every restored recipe is added, so the title check needs no further reads
        List<Recipe> existing = new ArrayList<>();
        List<RestoredRecipe> restored = new ArrayList<>();
        for (RecipeBackup backup : backups) {
            String image = null;
            try {
                image = imageRepository.upload(
                        readImage(zip, BackupRepository.RECIPE_IMAGE_DIR, backup.image(), ImageRepository.MAX_SIZE_BYTES));
                RecipeRequest request = new RecipeRequest();
                request.setTitle(backup.title());
                request.setImage(image);
                request.setDefaultPortions(backup.defaultPortions());
                request.setCuisine(backup.cuisine());
                request.setTags(backup.tags());
                request.setIngredients(backup.ingredients());
                request.setPreparation(backup.preparation());
                Recipe recipe = recipeRepository.create(request, existing);
                existing.add(recipe);
                restored.add(new RestoredRecipe(recipe, backup.relatedRecipes() == null ? List.of() : backup.relatedRecipes()));
            } catch (EntityStateException e) {
                imageRepository.deleteQuietly(image);
                result.getSkippedRecipes().add(String.valueOf(backup.title()));
                System.out.println("Restore: skipped recipe \"" + backup.title() + "\": " + e.getMessage());
            }
            // otherwise every image read so far stays in memory until the end of the request
            BaseDAO.clearSession();
        }

        // "Passt dazu", referenced by title, resolved to the new ids
        Map<String, Recipe> bySlug = new HashMap<>();
        for (Recipe recipe : existing) {
            bySlug.put(RecipeRepository.slug(recipe.getTitle()), recipe);
        }
        List<Recipe> withRelated = new ArrayList<>();
        for (RestoredRecipe entry : restored) {
            Recipe recipe = entry.recipe();
            for (String title : entry.relatedTitles()) {
                Recipe related = title == null ? null : bySlug.get(RecipeRepository.slug(title.trim()));
                if (related != null && !related.getId().equals(recipe.getId())
                        && !recipe.getRelatedRecipeIds().contains(related.getId())) {
                    recipe.getRelatedRecipeIds().add(related.getId());
                }
            }
            if (!recipe.getRelatedRecipeIds().isEmpty()) {
                withRelated.add(recipe);
            }
        }
        if (!withRelated.isEmpty()) {
            recipeRepository.saveAllUnchecked(withRelated);
        }
        result.setRecipes(existing.size());
    }

    private void restoreFolders(ZipFile zip, List<FolderBackup> backups, RestoreResponse result) throws IOException {
        List<RestoredFolder> restored = new ArrayList<>();
        Map<String, Long> idsByName = new HashMap<>();
        for (FolderBackup backup : backups) {
            try {
                TravelFolderRequest request = folderRequest(backup);
                TravelFolderDTO folder = travelRepository.createFolder(request);
                idsByName.put(folder.getName(), folder.getId());
                restored.add(new RestoredFolder(folder.getId(), request, backup.previousFolder()));
                result.setFolders(result.getFolders() + 1);

                if (backup.text() != null && !backup.text().isBlank()) {
                    travelRepository.setText(folder.getId(), backup.text());
                }
                restorePhotos(zip, backup, folder, result);
            } catch (EntityStateException e) {
                result.getSkippedFolders().add(String.valueOf(backup.name()));
                System.out.println("Restore: travel folder \"" + backup.name() + "\" not fully restored: " + e.getMessage());
            }
        }

        // the folder a trip came from, referenced by name, resolved to the new id
        for (RestoredFolder entry : restored) {
            Long previousId = entry.previousFolder() == null ? null : idsByName.get(entry.previousFolder());
            if (previousId == null) {
                continue;
            }
            try {
                entry.request().setPreviousFolderId(previousId);
                travelRepository.updateFolder(entry.id(), entry.request());
            } catch (EntityStateException e) {
                System.out.println("Restore: travel folder \"" + entry.request().getName()
                        + "\" stays without its previous folder: " + e.getMessage());
            }
        }
    }

    /** The photos of a folder in their order, with their captions and the photo shown on the folder. */
    private void restorePhotos(ZipFile zip, FolderBackup backup, TravelFolderDTO folder, RestoreResponse result)
            throws IOException {
        List<String> photos = backup.photos() == null ? List.of() : backup.photos();
        Map<String, String> captions = backup.captions() == null ? Map.of() : backup.captions();
        Long cover = null;
        for (int i = 0; i < photos.size(); i++) {
            String fileName = photos.get(i);
            try {
                byte[] data = readImage(zip, BackupRepository.TRAVEL_IMAGE_DIR, fileName, TravelRepository.MAX_PHOTO_BYTES);
                Long photoId = travelRepository.addPhoto(folder.getId(), data).getPhotos().getLast().getId();
                result.setPhotos(result.getPhotos() + 1);

                String caption = captions.get(fileName);
                if (caption != null && !caption.isBlank()) {
                    travelRepository.setCaption(photoId, caption);
                }
                // the first photo is shown on the folder anyway
                if (i > 0 && fileName.equals(backup.cover())) {
                    cover = photoId;
                }
            } catch (EntityStateException e) {
                result.setSkippedPhotos(result.getSkippedPhotos() + 1);
                System.out.println("Restore: skipped photo " + fileName + " of travel folder \"" + backup.name()
                        + "\": " + e.getMessage());
            }
            // otherwise every photo read so far stays in memory until the end of the request
            BaseDAO.clearSession();
        }
        if (cover != null) {
            travelRepository.setCover(folder.getId(), cover);
        }
    }

    /** Everything of a folder but the folder its trip came from, which may not exist yet. */
    private static TravelFolderRequest folderRequest(FolderBackup backup) {
        TravelFolderRequest request = new TravelFolderRequest();
        request.setName(backup.name());
        request.setCountry(backup.country());
        if (backup.stops() != null) {
            request.setStops(backup.stops().stream()
                    .map(stop -> new TravelStopRequest(stop.name(), stop.latitude(), stop.longitude()))
                    .toList());
        } else if (backup.latitude() != null && backup.longitude() != null) {
            // a file built like the seed data, which only knows one place per folder
            request.setStops(List.of(new TravelStopRequest(backup.name(), backup.latitude(), backup.longitude())));
        }
        request.setStartMonth(backup.startMonth());
        request.setEndMonth(backup.endMonth());
        request.setCuisine(backup.cuisine());
        return request;
    }

    private static ZipFile open(Path file) throws IOException {
        try {
            return new ZipFile(file.toFile(), StandardCharsets.UTF_8);
        } catch (ZipException e) {
            throw new EntityStateException("The file is not a ZIP file");
        }
    }

    private <T> List<T> readList(ZipFile zip, String name, Class<T> type) throws IOException {
        ZipEntry entry = zip.getEntry(name);
        if (entry == null) {
            throw new EntityStateException("The file is not a backup of this website: " + name + " is missing");
        }
        List<T> list;
        try (InputStream in = zip.getInputStream(entry)) {
            list = objectMapper.readValue(in, objectMapper.getTypeFactory().constructCollectionType(List.class, type));
        } catch (JsonProcessingException e) {
            throw new EntityStateException("The file is not a backup of this website: " + name + " cannot be read");
        }
        if (list == null || list.contains(null)) {
            throw new EntityStateException("The file is not a backup of this website: " + name + " cannot be read");
        }
        return list;
    }

    /**
     * An image of the backup by the name the list has for it.
     *
     * @param maxBytes not more than one byte beyond this is read; the repository then rejects the image as too large
     */
    private static byte[] readImage(ZipFile zip, String directory, String fileName, long maxBytes) throws IOException {
        if (fileName == null || fileName.isBlank() || fileName.contains("/") || fileName.contains("\\") || fileName.contains("..")) {
            throw new EntityStateException("The image has no valid file name");
        }
        ZipEntry entry = zip.getEntry(directory + fileName);
        if (entry == null) {
            throw new EntityStateException(directory + fileName + " is missing in the backup");
        }
        try (InputStream in = zip.getInputStream(entry)) {
            return in.readNBytes((int) maxBytes + 1);
        }
    }
}
