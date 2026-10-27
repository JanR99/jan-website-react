package de.jan.image;

import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

/**
 * An image stored in the Datastore: its bytes and their content type. Not an entity itself; each subclass
 * is one, with its own kind, and the fields here are stored with it. Datastore entities are limited to 1 MiB.
 */
public abstract class StoredImage implements DatastoreEntity {

    @Id
    private Long id;

    private byte[] data;

    private String contentType;

    /** for Objectify */
    protected StoredImage() {

    }

    /** @param id null to let the Datastore choose one */
    protected StoredImage(Long id, byte[] data, String contentType) {
        this.id = id;
        this.data = data;
        this.contentType = contentType;
    }

    public Long getId() { return id; }
    public byte[] getData() { return data; }
    public String getContentType() { return contentType; }
}
