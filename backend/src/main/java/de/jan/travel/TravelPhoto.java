package de.jan.travel;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import de.jan.objectify.DatastoreEntity;

import java.util.Date;

/**
 * A photo of a travel folder. Only says that the photo exists and where it belongs; the image data
 * is kept in a TravelPhotoFile with the same id, so listing the folders doesn't load any images.
 */
@Entity
public class TravelPhoto implements DatastoreEntity {

    @Id
    private Long id;

    @Index
    private Long folderId;

    /** photos are shown in the order they were added */
    private Date createdAt;

    public TravelPhoto() {

    }

    public TravelPhoto(Long folderId, Date createdAt) {
        this.folderId = folderId;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getFolderId() { return folderId; }
    public Date getCreatedAt() { return createdAt; }
}
