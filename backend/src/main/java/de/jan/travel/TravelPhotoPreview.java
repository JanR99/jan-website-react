package de.jan.travel;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

/**
 * A small version of a TravelPhoto for the tiles (gallery, folder cards, home page), stored under the id
 * of the photo. Made from the TravelPhotoFile the first time it is asked for, see TravelRepository.getPhotoPreview;
 * not part of a backup, since it can always be made again.
 */
@Entity
public class TravelPhotoPreview implements DatastoreEntity {

    /** id of the TravelPhoto */
    @Id
    private Long id;

    private byte[] data;

    private String contentType;

    public TravelPhotoPreview() {

    }

    public TravelPhotoPreview(Long photoId, byte[] data, String contentType) {
        this.id = photoId;
        this.data = data;
        this.contentType = contentType;
    }

    public Long getId() { return id; }
    public byte[] getData() { return data; }
    public String getContentType() { return contentType; }
}
