package de.jan.travel.repository;

import de.jan.image.ImageScaler;
import de.jan.image.ImageType;
import de.jan.image.StoredImage;
import de.jan.travel.TravelPhotoFile;
import de.jan.travel.TravelPhotoPreview;
import de.jan.travel.TravelPhotoPreviewDAO;
import org.springframework.stereotype.Component;

@Component
public class TravelPhotoPreviewRepository {

    /** Shorter side of the small version: fills a 256 px tile on screens with twice the pixel density. */
    public static final int PREVIEW_SIZE = 512;

    private final TravelPhotoPreviewDAO previewDAO = new TravelPhotoPreviewDAO();
    private final TravelPhotoFileRepository fileRepository;

    public TravelPhotoPreviewRepository(TravelPhotoFileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    /**
     * The small version of a photo for the tiles: made from the photo the first time and stored from then on.
     * If the photo is that small already or can't be scaled, the photo itself. Null if there is no photo.
     */
    public StoredImage get(Long photoId) {
        TravelPhotoPreview stored = previewDAO.get(photoId);
        if (stored != null) {
            return stored;
        }
        TravelPhotoFile file = fileRepository.get(photoId);
        if (file == null) {
            return null;
        }
        byte[] scaled = ImageScaler.scaleDown(file.getData(), PREVIEW_SIZE);
        if (scaled == null) {
            return file;
        }
        return previewDAO.save(new TravelPhotoPreview(photoId, scaled, ImageType.JPEG.contentType()));
    }

    public void delete(Long photoId) {
        previewDAO.delete(photoId);
    }
}
