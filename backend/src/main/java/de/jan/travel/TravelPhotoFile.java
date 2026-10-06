package de.jan.travel;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

/**
 * The image data of a TravelPhoto, stored under the same id. There is one version of every photo,
 * used for the gallery and when the photo is opened. Datastore entities are limited to 1 MiB,
 * see TravelRepository.MAX_PHOTO_BYTES.
 */
@Entity
public class TravelPhotoFile implements DatastoreEntity {

    /** id of the TravelPhoto */
    @Id
    private Long id;

    private byte[] data;

    private String contentType;

    public TravelPhotoFile() {

    }

    public TravelPhotoFile(Long photoId, byte[] data, String contentType) {
        this.id = photoId;
        this.data = data;
        this.contentType = contentType;
    }

    public Long getId() { return id; }
    public byte[] getData() { return data; }
    public String getContentType() { return contentType; }
}
