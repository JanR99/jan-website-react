package de.jan.image;

import com.googlecode.objectify.Key;
import de.jan.exceptions.EntityStateException;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Uploaded recipe images live in the Datastore as RecipeImage. A recipe refers to one
 * with image = "uploads/<id>"; older recipes use a file name inside public/Bilder.
 */
@Component
public class ImageRepository {

    public static final String UPLOAD_PREFIX = "uploads/";

    /** The browser scales images down to about 800 KB; the entity itself may be at most 1 MiB. */
    public static final long MAX_SIZE_BYTES = 900L * 1024;

    /** Uploads not saved with a recipe within this time are removed on the next start. */
    private static final Duration ORPHAN_AGE = Duration.ofDays(1);

    private static final Pattern UPLOAD_REFERENCE = Pattern.compile("^uploads/(\\d+)$");

    private final RecipeImageDAO imageDAO;

    public ImageRepository() {
        this.imageDAO = new RecipeImageDAO();
    }

    /** Stores the image and returns the value for RecipeImage ("uploads/<id>"). */
    public String upload(byte[] data) {
        if (data == null || data.length == 0) {
            throw new EntityStateException("The image is empty");
        }
        if (data.length > MAX_SIZE_BYTES) {
            throw new EntityStateException("The image must be at most " + MAX_SIZE_BYTES / 1024 + " KB");
        }
        ImageType type = ImageType.detect(data);
        RecipeImage saved = imageDAO.save(new RecipeImage(data, type.contentType()));
        return UPLOAD_PREFIX + saved.getId();
    }

    public RecipeImage getById(Long id) {
        return id == null ? null : imageDAO.getById(id);
    }

    public static boolean isUpload(String image) {
        return image != null && image.startsWith(UPLOAD_PREFIX);
    }

    /** "uploads/<id>" -> id, null for anything else */
    public static Long idOf(String image) {
        if (image == null) {
            return null;
        }
        Matcher matcher = UPLOAD_REFERENCE.matcher(image);
        return matcher.matches() ? Long.valueOf(matcher.group(1)) : null;
    }

    public boolean isValidUpload(String image) {
        Long id = idOf(image);
        return id != null && imageDAO.exists(id);
    }

    /** Best effort: a leftover image is not worth failing the request for. */
    public void deleteQuietly(String image) {
        Long id = idOf(image);
        if (id == null) {
            return;
        }
        try {
            imageDAO.delete(id);
        } catch (Exception e) {
            System.out.println("Could not delete image " + image + ": " + e.getMessage());
        }
    }

    /**
     * Deletes images that were uploaded in the editor but never saved with a recipe
     * (e.g. the editor was canceled). Returns the number of deleted images.
     */
    public int deleteOrphans(Set<Long> referencedIds) {
        Date cutoff = new Date(System.currentTimeMillis() - ORPHAN_AGE.toMillis());
        List<Key<RecipeImage>> orphans = imageDAO.getKeysCreatedBefore(cutoff).stream()
                .filter(key -> !referencedIds.contains(key.getId()))
                .toList();
        if (!orphans.isEmpty()) {
            imageDAO.deleteKeys(orphans);
        }
        return orphans.size();
    }
}
