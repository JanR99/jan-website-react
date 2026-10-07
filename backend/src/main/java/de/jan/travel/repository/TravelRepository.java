package de.jan.travel.repository;

import de.jan.controller.requests.TravelFolderRequest;
import de.jan.exceptions.EntityNotFoundException;
import de.jan.exceptions.EntityStateException;
import de.jan.image.ImageType;
import de.jan.travel.TravelFolder;
import de.jan.travel.TravelFolderDAO;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.TravelPhoto;
import de.jan.travel.TravelPhotoDAO;
import de.jan.travel.TravelPhotoFile;
import de.jan.travel.TravelPhotoFileDAO;
import de.jan.travel.TravelSeedMarker;
import de.jan.travel.TravelSeedMarkerDAO;
import org.springframework.stereotype.Component;

import java.text.Collator;
import java.time.Duration;
import java.util.Collection;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * The travel diary: folders (one per trip) and their photos. A photo is a TravelPhoto plus
 * a TravelPhotoFile with the image data.
 */
@Component
public class TravelRepository {

    private static final Duration CACHE_TTL = Duration.ofSeconds(60);

    public static final int MAX_PHOTOS_PER_FOLDER = 200;

    /** The browser scales photos down to about 400 KB; the entity itself may be at most 1 MiB. */
    public static final long MAX_PHOTO_BYTES = 500L * 1024;

    private static final int NAME_MAX_LENGTH = 80;
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final Comparator<TravelPhoto> PHOTO_ORDER = Comparator
            .comparing(TravelPhoto::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder()))
            .thenComparing(TravelPhoto::getId);

    private final TravelFolderDAO folderDAO;
    private final TravelPhotoDAO photoDAO;
    private final TravelPhotoFileDAO fileDAO;
    private final TravelSeedMarkerDAO seedMarkerDAO;

    private volatile List<TravelFolderDTO> cache;
    private volatile long cachedAt;

    public TravelRepository() {
        this.folderDAO = new TravelFolderDAO();
        this.photoDAO = new TravelPhotoDAO();
        this.fileDAO = new TravelPhotoFileDAO();
        this.seedMarkerDAO = new TravelSeedMarkerDAO();
    }

    /** All folders sorted by name, each with the ids of its photos. */
    public List<TravelFolderDTO> getFolders() {
        List<TravelFolderDTO> current = cache;
        if (current != null && System.currentTimeMillis() - cachedAt < CACHE_TTL.toMillis()) {
            return current;
        }
        Map<Long, List<TravelPhoto>> photosByFolder = photoDAO.getAll().stream()
                .collect(Collectors.groupingBy(TravelPhoto::getFolderId));
        Collator collator = Collator.getInstance(Locale.GERMAN);
        List<TravelFolderDTO> result = folderDAO.getAll().stream()
                .sorted(Comparator.comparing(TravelFolder::getName, collator))
                .map(folder -> toDTO(folder, photosByFolder.getOrDefault(folder.getId(), List.of())))
                .toList();
        cache = result;
        cachedAt = System.currentTimeMillis();
        return result;
    }

    /** One folder, read from the database and not from the cache. */
    public TravelFolderDTO getFolder(Long id) {
        TravelFolder folder = loadFolder(id);
        return toDTO(folder, photoDAO.getByFolderId(folder.getId()));
    }

    public TravelFolderDTO createFolder(TravelFolderRequest request) {
        TravelFolder folder = new TravelFolder();
        folder.setCreatedAt(new Date());
        apply(folder, request);
        TravelFolder saved = folderDAO.save(folder);
        invalidateCache();
        return toDTO(saved, List.of());
    }

    /** Changes name, country and the place on the map. */
    public TravelFolderDTO updateFolder(Long id, TravelFolderRequest request) {
        TravelFolder folder = loadFolder(id);
        apply(folder, request);
        folderDAO.save(folder);
        invalidateCache();
        return getFolder(id);
    }

    /** Chooses the photo shown on the folder; null means the first photo again. */
    public TravelFolderDTO setCover(Long id, Long photoId) {
        TravelFolder folder = loadFolder(id);
        if (photoId != null) {
            TravelPhoto photo = photoDAO.getById(photoId);
            if (photo == null || !id.equals(photo.getFolderId())) {
                throw new EntityStateException("The photo does not belong to this folder");
            }
        }
        folder.setCoverPhotoId(photoId);
        folderDAO.save(folder);
        invalidateCache();
        return getFolder(id);
    }

    /** Deletes the folder together with all of its photos. */
    public void deleteFolder(Long id) {
        TravelFolder folder = loadFolder(id);
        List<TravelPhoto> photos = photoDAO.getByFolderId(id);
        for (TravelPhoto photo : photos) {
            fileDAO.delete(photo.getId());
        }
        if (!photos.isEmpty()) {
            photoDAO.deleteAll(photos);
        }
        folderDAO.delete(folder);
        invalidateCache();
    }

    /** Adds a photo at the end of the folder. The browser has scaled it down already. */
    public TravelFolderDTO addPhoto(Long folderId, byte[] data) {
        TravelFolder folder = loadFolder(folderId);
        if (data == null || data.length == 0) {
            throw new EntityStateException("The image is empty");
        }
        if (data.length > MAX_PHOTO_BYTES) {
            throw new EntityStateException("The image must be at most " + MAX_PHOTO_BYTES / 1024 + " KB");
        }
        String contentType = ImageType.detect(data).contentType();
        List<TravelPhoto> existing = photoDAO.getByFolderId(folderId);
        if (existing.size() >= MAX_PHOTOS_PER_FOLDER) {
            throw new EntityStateException("A folder can have at most " + MAX_PHOTOS_PER_FOLDER + " photos");
        }
        // always later than the last photo, so the order also holds for uploads within the same millisecond
        long latest = existing.stream().map(TravelPhoto::getCreatedAt).filter(Objects::nonNull)
                .mapToLong(Date::getTime).max().orElse(0);
        Date createdAt = new Date(Math.max(System.currentTimeMillis(), latest + 1));

        // the file is stored under the id of the photo, so the photo has to be saved first
        TravelPhoto photo = photoDAO.save(new TravelPhoto(folder.getId(), createdAt));
        try {
            fileDAO.save(new TravelPhotoFile(photo.getId(), data, contentType));
        } catch (RuntimeException e) {
            deleteQuietly(photo);
            throw e;
        } finally {
            invalidateCache();
        }
        return getFolder(folderId);
    }

    public void deletePhoto(Long id) {
        TravelPhoto photo = id == null ? null : photoDAO.getById(id);
        if (photo == null) {
            throw new EntityNotFoundException("Photo " + id + " not found");
        }
        fileDAO.delete(id);
        photoDAO.delete(photo);

        TravelFolder folder = folderDAO.getById(photo.getFolderId());
        if (folder != null && id.equals(folder.getCoverPhotoId())) {
            folder.setCoverPhotoId(null);
            folderDAO.save(folder);
        }
        invalidateCache();
    }

    /** The image data of a photo, null if there is none. */
    public TravelPhotoFile getPhotoFile(Long photoId) {
        return fileDAO.getById(photoId);
    }

    /** Whether the folders of resources/travel/folders.json have all been imported, see TravelSeedMarker. */
    public boolean isSeedImported() {
        return seedMarkerDAO.exists(TravelSeedMarker.ID);
    }

    public void markSeedImported() {
        seedMarkerDAO.save(new TravelSeedMarker(new Date()));
    }

    private TravelFolder loadFolder(Long id) {
        TravelFolder folder = id == null ? null : folderDAO.getById(id);
        if (folder == null) {
            throw new EntityNotFoundException("Folder " + id + " not found");
        }
        return folder;
    }

    private static TravelFolderDTO toDTO(TravelFolder folder, Collection<TravelPhoto> photos) {
        return TravelFolderDTO.from(folder, photos.stream().sorted(PHOTO_ORDER).map(TravelPhoto::getId).toList());
    }

    private void apply(TravelFolder folder, TravelFolderRequest request) {
        String name = collapse(request.getName());
        if (name.isEmpty()) {
            throw new EntityStateException("Name must not be empty");
        }
        requireMaxLength(name, "Name");
        boolean taken = folderDAO.getAll().stream()
                .anyMatch(other -> !Objects.equals(other.getId(), folder.getId()) && other.getName().equalsIgnoreCase(name));
        if (taken) {
            throw new EntityStateException("A folder with this name already exists");
        }

        String country = collapse(request.getCountry());
        requireMaxLength(country, "Country");

        Double latitude = request.getLatitude();
        Double longitude = request.getLongitude();
        if ((latitude == null) != (longitude == null)) {
            throw new EntityStateException("Latitude and longitude must be given together");
        }
        if (latitude != null) {
            requireRange(latitude, 90, "Latitude");
            requireRange(longitude, 180, "Longitude");
        }

        folder.setName(name);
        folder.setCountry(country);
        folder.setPosition(latitude, longitude);
    }

    /** Best effort: removes a photo whose file could not be stored. */
    private void deleteQuietly(TravelPhoto photo) {
        try {
            fileDAO.delete(photo.getId());
            photoDAO.delete(photo);
        } catch (Exception e) {
            System.out.println("Could not delete travel photo " + photo.getId() + ": " + e.getMessage());
        }
    }

    private void invalidateCache() {
        cache = null;
    }

    private static String collapse(String value) {
        return value == null ? "" : WHITESPACE.matcher(value.trim()).replaceAll(" ");
    }

    /** NaN and infinite values are out of range as well. */
    private static void requireRange(double value, int limit, String label) {
        if (!(Math.abs(value) <= limit)) {
            throw new EntityStateException(label + " must be between -" + limit + " and " + limit);
        }
    }

    private static void requireMaxLength(String value, String label) {
        if (value.length() > NAME_MAX_LENGTH) {
            throw new EntityStateException(label + " must be at most " + NAME_MAX_LENGTH + " characters long");
        }
    }
}
