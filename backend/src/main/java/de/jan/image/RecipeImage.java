package de.jan.image;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Index;

import java.util.Date;

/**
 * An uploaded recipe image, kept in its own entity so loading the recipe list doesn't load the images.
 * Datastore entities are limited to 1 MiB, see ImageRepository.MAX_SIZE_BYTES.
 */
@Entity
public class RecipeImage extends StoredImage {

    /** for cleaning up images that were uploaded but never saved with a recipe */
    @Index
    private Date createdAt;

    public RecipeImage() {

    }

    public RecipeImage(byte[] data, String contentType) {
        super(null, data, contentType);
        this.createdAt = new Date();
    }

    public Date getCreatedAt() { return createdAt; }
}
