package de.jan.travel;

import com.googlecode.objectify.annotation.Entity;
import de.jan.image.StoredImage;

/**
 * A small version of a TravelPhoto for the tiles (gallery, folder cards, home page), stored under the id
 * of the photo. Made from the TravelPhotoFile the first time it is asked for, see TravelRepository.getPhotoPreview;
 * not part of a backup, since it can always be made again.
 */
@Entity
public class TravelPhotoPreview extends StoredImage {

    public TravelPhotoPreview() {

    }

    public TravelPhotoPreview(Long photoId, byte[] data, String contentType) {
        super(photoId, data, contentType);
    }
}
