package de.jan.image;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import de.jan.objectify.DatastoreEntity;

import java.util.Date;

/**
 * An uploaded recipe image, kept in its own entity so loading the recipe list doesn't load the images.
 * Datastore entities are limited to 1 MiB, see ImageRepository.MAX_SIZE_BYTES.
 */
@Entity
public class RecipeImage implements DatastoreEntity {

    @Id
    private Long id;

    private byte[] data;

    private String contentType;

    /** for cleaning up images that were uploaded but never saved with a recipe */
    @Index
    private Date createdAt;

    public RecipeImage() {

    }

    public RecipeImage(byte[] data, String contentType) {
        this.data = data;
        this.contentType = contentType;
        this.createdAt = new Date();
    }

    public Long getId() { return id; }
    public byte[] getData() { return data; }
    public String getContentType() { return contentType; }
    public Date getCreatedAt() { return createdAt; }
}
