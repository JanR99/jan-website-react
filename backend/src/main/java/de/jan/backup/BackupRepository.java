package de.jan.backup;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.jan.image.ImageRepository;
import de.jan.image.ImageType;
import de.jan.image.RecipeImage;
import de.jan.objectify.BaseDAO;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeTag;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.TravelPhotoDTO;
import de.jan.travel.TravelPhotoFile;
import de.jan.travel.repository.TravelRepository;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.zip.Deflater;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * The backup of the recipes and the travel diary: one ZIP file with everything that is stored about
 * them, images included. It is built like the seed data in resources: recipes/recipes.json with
 * recipes/images, and travel/folders.json with travel/images.
 */
@Component
public class BackupRepository {

    public static final String RECIPES_FILE = "recipes/recipes.json";
    public static final String RECIPE_IMAGE_DIR = "recipes/images/";
    public static final String FOLDERS_FILE = "travel/folders.json";
    public static final String TRAVEL_IMAGE_DIR = "travel/images/";

    private static final ZoneId ZONE = ZoneId.of("Europe/Berlin");

    /**
     * A recipe the way recipes.json of the seed data has it: the image as the name of its file
     * (null if the recipe has none), "Passt dazu" as the titles of the recipes.
     */
    public record RecipeBackup(
            String title,
            String image,
            int defaultPortions,
            String cuisine,
            List<RecipeTag> tags,
            List<String> ingredients,
            List<String> preparation,
            List<String> relatedRecipes
    ) {
    }

    /**
     * A folder the way folders.json of the seed data has it (name, country, place on the map as the first
     * stop and the photos as the names of their files), plus what the seed data doesn't know: all stops,
     * the name of the folder the trip came from, when the trip was, its cuisine and text, the photo shown
     * on the folder and the captions by the name of the photo.
     */
    public record FolderBackup(
            String name,
            String country,
            Double latitude,
            Double longitude,
            List<StopBackup> stops,
            String previousFolder,
            String startMonth,
            String endMonth,
            String cuisine,
            String text,
            String cover,
            List<String> photos,
            Map<String, String> captions
    ) {
    }

    /** A stop of a folder, in the order of the trip. */
    public record StopBackup(String name, double latitude, double longitude) {
    }

    private final RecipeRepository recipeRepository;
    private final ImageRepository imageRepository;
    private final TravelRepository travelRepository;
    private final ObjectMapper objectMapper;

    public BackupRepository(RecipeRepository recipeRepository, ImageRepository imageRepository,
                            TravelRepository travelRepository, ObjectMapper objectMapper) {
        this.recipeRepository = recipeRepository;
        this.imageRepository = imageRepository;
        this.travelRepository = travelRepository;
        this.objectMapper = objectMapper;
    }

    /** The name the downloaded file gets, with the date of today. */
    public String fileName() {
        return "jan-website-backup-" + LocalDate.now(ZONE) + ".zip";
    }

    /**
     * Writes the backup as a ZIP file. The images are read and written one after the other,
     * so the file is never held in memory as a whole. The stream is not closed.
     */
    public void writeBackup(OutputStream out) throws IOException {
        ZipOutputStream zip = new ZipOutputStream(out, StandardCharsets.UTF_8);
        writeJson(zip, RECIPES_FILE, writeRecipeImages(zip));
        writeJson(zip, FOLDERS_FILE, writeTravelPhotos(zip));
        zip.finish();
    }

    /** Writes the images of the recipes and returns the recipes for recipes.json. */
    private List<RecipeBackup> writeRecipeImages(ZipOutputStream zip) throws IOException {
        List<Recipe> recipes = recipeRepository.getAll();
        Map<Long, String> titles = new HashMap<>();
        for (Recipe recipe : recipes) {
            titles.put(recipe.getId(), recipe.getTitle());
        }

        // by the id of the image, in case two recipes share one
        Map<Long, String> written = new HashMap<>();
        List<RecipeBackup> result = new ArrayList<>();
        for (Recipe recipe : recipes) {
            Long imageId = ImageRepository.idOf(recipe.getImage());
            String fileName = written.get(imageId);
            if (fileName == null) {
                RecipeImage image = imageRepository.getById(imageId);
                if (image != null) {
                    fileName = writeImage(zip, RECIPE_IMAGE_DIR, imageId, image.getData());
                    written.put(imageId, fileName);
                }
            }
            List<String> related = recipe.getRelatedRecipeIds().stream()
                    .map(titles::get)
                    .filter(Objects::nonNull)
                    .toList();
            result.add(new RecipeBackup(recipe.getTitle(), fileName, recipe.getDefaultPortions(), recipe.getCuisine(),
                    recipe.getTags(), recipe.getIngredients(), recipe.getPreparation(), related));
        }
        return result;
    }

    /** Writes the photos of the travel diary and returns the folders for folders.json. */
    private List<FolderBackup> writeTravelPhotos(ZipOutputStream zip) throws IOException {
        List<FolderBackup> result = new ArrayList<>();
        List<TravelFolderDTO> folders = travelRepository.getFolders();
        Map<Long, String> names = new HashMap<>();
        for (TravelFolderDTO folder : folders) {
            names.put(folder.getId(), folder.getName());
        }
        for (TravelFolderDTO folder : folders) {
            List<String> photos = new ArrayList<>();
            Map<String, String> captions = new LinkedHashMap<>();
            String cover = null;
            for (TravelPhotoDTO photo : folder.getPhotos()) {
                TravelPhotoFile file = travelRepository.getPhotoFile(photo.getId());
                if (file == null) {
                    continue;
                }
                String fileName = writeImage(zip, TRAVEL_IMAGE_DIR, photo.getId(), file.getData());
                photos.add(fileName);
                if (!photo.getCaption().isEmpty()) {
                    captions.put(fileName, photo.getCaption());
                }
                if (photo.getId().equals(folder.getCoverPhotoId())) {
                    cover = fileName;
                }
            }
            List<StopBackup> stops = folder.getStops().stream()
                    .map(stop -> new StopBackup(stop.getName(), stop.getLatitude(), stop.getLongitude()))
                    .toList();
            StopBackup first = stops.isEmpty() ? null : stops.getFirst();
            result.add(new FolderBackup(folder.getName(), folder.getCountry(),
                    first == null ? null : first.latitude(), first == null ? null : first.longitude(),
                    stops, names.get(folder.getPreviousFolderId()),
                    folder.getStartMonth(), folder.getEndMonth(), folder.getCuisine(), folder.getText(), cover, photos, captions));
        }
        return result;
    }

    /** Writes an image as "<id>.jpg" (or .png, .webp) into the directory and returns that file name. */
    private static String writeImage(ZipOutputStream zip, String directory, Long id, byte[] data) throws IOException {
        String fileName = id + "." + ImageType.detect(data).extension();
        // images are compressed already
        zip.setLevel(Deflater.NO_COMPRESSION);
        zip.putNextEntry(new ZipEntry(directory + fileName));
        zip.write(data);
        zip.closeEntry();
        // otherwise every image read so far stays in memory until the end of the request
        BaseDAO.clearSession();
        return fileName;
    }

    private void writeJson(ZipOutputStream zip, String name, Object value) throws IOException {
        zip.setLevel(Deflater.DEFAULT_COMPRESSION);
        zip.putNextEntry(new ZipEntry(name));
        zip.write(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(value));
        zip.closeEntry();
    }
}
