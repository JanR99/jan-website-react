package de.jan.travel.repository;

import de.jan.travel.TravelPhotoFile;
import de.jan.travel.TravelPhotoFileDAO;
import org.springframework.stereotype.Component;

@Component
public class TravelPhotoFileRepository {

    private final TravelPhotoFileDAO fileDAO = new TravelPhotoFileDAO();

    /** The image data of a photo, null if there is none. */
    public TravelPhotoFile get(Long photoId) {
        return fileDAO.get(photoId);
    }

    public void save(Long photoId, byte[] data, String contentType) {
        fileDAO.save(new TravelPhotoFile(photoId, data, contentType));
    }

    public void delete(Long photoId) {
        fileDAO.delete(photoId);
    }
}
