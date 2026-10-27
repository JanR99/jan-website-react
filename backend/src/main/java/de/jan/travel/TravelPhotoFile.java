package de.jan.travel;

import com.googlecode.objectify.annotation.Entity;
import de.jan.image.StoredImage;

/**
 * The image data of a TravelPhoto, stored under the same id. There is one version of every photo,
 * used for the gallery and when the photo is opened. Datastore entities are limited to 1 MiB,
 * see TravelRepository.MAX_PHOTO_BYTES.
 */
@Entity
public class TravelPhotoFile extends StoredImage {

    public TravelPhotoFile() {

    }

    public TravelPhotoFile(Long photoId, byte[] data, String contentType) {
        super(photoId, data, contentType);
    }
}
