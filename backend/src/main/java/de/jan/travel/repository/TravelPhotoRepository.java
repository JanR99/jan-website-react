package de.jan.travel.repository;

import de.jan.exceptions.EntityStateException;
import de.jan.image.ImageType;
import de.jan.travel.TravelPhoto;
import de.jan.travel.TravelPhotoDAO;
import de.jan.util.TextRules;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

import static de.jan.util.TextCleaner.collapse;

/** The photos of the travel diary. Changes that also concern the folder go through TravelFolderRepository. */
@Component
public class TravelPhotoRepository {

    private static final Logger log = LoggerFactory.getLogger(TravelPhotoRepository.class);

    public static final int MAX_PHOTOS_PER_FOLDER = 200;

    /** The browser scales photos down to about 400 KB; the entity itself may be at most 1 MiB. */
    public static final long MAX_PHOTO_BYTES = 500L * 1024;

    public static final int CAPTION_MAX_LENGTH = 200;

    /** The sorted photos by their position, then the ones added since in the order they were added. */
    private static final Comparator<TravelPhoto> PHOTO_ORDER = Comparator
            .comparing(TravelPhoto::getPosition, Comparator.nullsLast(Comparator.naturalOrder()))
            .thenComparing(TravelPhoto::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder()))
            .thenComparing(TravelPhoto::getId);

    private final TravelPhotoDAO photoDAO = new TravelPhotoDAO();
    private final TravelPhotoFileRepository fileRepository;
    private final TravelPhotoPreviewRepository previewRepository;

    public TravelPhotoRepository(TravelPhotoFileRepository fileRepository, TravelPhotoPreviewRepository previewRepository) {
        this.fileRepository = fileRepository;
        this.previewRepository = previewRepository;
    }

    /** Null if there is none. */
    public TravelPhoto get(Long id) {
        return photoDAO.get(id);
    }

    public List<TravelPhoto> getByFolder(Long folderId) {
        return photoDAO.getByFolderId(folderId).stream().sorted(PHOTO_ORDER).toList();
    }

    /** The photos of all folders, by folder id. */
    public Map<Long, List<TravelPhoto>> getAllByFolder() {
        return photoDAO.getAll().stream()
                .sorted(PHOTO_ORDER)
                .collect(Collectors.groupingBy(TravelPhoto::getFolderId));
    }

    /** Adds a photo at the end of the folder. The browser has scaled it down already. */
    public TravelPhoto add(Long folderId, byte[] data) {
        String contentType = ImageType.check(data, MAX_PHOTO_BYTES).contentType();
        List<TravelPhoto> existing = photoDAO.getByFolderId(folderId);
        if (existing.size() >= MAX_PHOTOS_PER_FOLDER) {
            throw new EntityStateException("A folder can have at most " + MAX_PHOTOS_PER_FOLDER + " photos");
        }
        // always later than the last photo, so the order also holds for uploads within the same millisecond
        long latest = existing.stream().map(TravelPhoto::getCreatedAt).filter(Objects::nonNull)
                .mapToLong(Date::getTime).max().orElse(0);
        Date createdAt = new Date(Math.max(System.currentTimeMillis(), latest + 1));

        // the file is stored under the id of the photo, so the photo has to be saved first
        TravelPhoto photo = photoDAO.save(new TravelPhoto(folderId, createdAt));
        try {
            fileRepository.save(photo.getId(), data, contentType);
        } catch (RuntimeException e) {
            deleteQuietly(photo);
            throw e;
        }
        return photo;
    }

    /** @param photoIds the ids of all photos of the folder, each one once */
    public void setOrder(Long folderId, List<Long> photoIds) {
        List<TravelPhoto> photos = photoDAO.getByFolderId(folderId);
        Map<Long, TravelPhoto> byId = photos.stream()
                .collect(Collectors.toMap(TravelPhoto::getId, photo -> photo));
        if (photoIds == null || photoIds.size() != photos.size() || !new HashSet<>(photoIds).equals(byId.keySet())) {
            throw new EntityStateException("The order must name every photo of the folder exactly once");
        }
        for (int i = 0; i < photoIds.size(); i++) {
            byId.get(photoIds.get(i)).setPosition(i);
        }
        if (!photos.isEmpty()) {
            photoDAO.saveAll(photos);
        }
    }

    /** Sets the text shown below a photo; an empty one removes it. */
    public TravelPhoto setCaption(Long photoId, String caption) {
        TravelPhoto photo = photoDAO.getOrThrow(photoId);
        String text = collapse(caption);
        TextRules.requireMaxLength(text, "Caption", CAPTION_MAX_LENGTH);
        photo.setCaption(text);
        return photoDAO.save(photo);
    }

    /** Deletes the photo with its image data; returns it, so the folder can follow. */
    public TravelPhoto delete(Long id) {
        TravelPhoto photo = photoDAO.getOrThrow(id);
        fileRepository.delete(id);
        previewRepository.delete(id);
        photoDAO.delete(photo);
        return photo;
    }

    public void deleteAllOf(Long folderId) {
        List<TravelPhoto> photos = photoDAO.getByFolderId(folderId);
        for (TravelPhoto photo : photos) {
            fileRepository.delete(photo.getId());
            previewRepository.delete(photo.getId());
        }
        if (!photos.isEmpty()) {
            photoDAO.deleteAll(photos);
        }
    }

    /** Best effort: removes a photo whose file could not be stored. */
    private void deleteQuietly(TravelPhoto photo) {
        try {
            fileRepository.delete(photo.getId());
            photoDAO.delete(photo);
        } catch (Exception e) {
            log.warn("Could not delete travel photo {}: {}", photo.getId(), e.getMessage());
        }
    }
}
