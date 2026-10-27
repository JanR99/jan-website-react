package de.jan.travel.repository;

import de.jan.controller.requests.TravelFolderRequest;
import de.jan.controller.requests.TravelStopRequest;
import de.jan.exceptions.EntityNotFoundException;
import de.jan.exceptions.EntityStateException;
import de.jan.image.ImageScaler;
import de.jan.image.ImageType;
import de.jan.travel.TravelFolder;
import de.jan.travel.TravelFolderDAO;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.TravelPhoto;
import de.jan.travel.TravelPhotoDAO;
import de.jan.travel.TravelPhotoFile;
import de.jan.travel.TravelPhotoFileDAO;
import de.jan.travel.TravelPhotoPreview;
import de.jan.travel.TravelPhotoPreviewDAO;
import de.jan.travel.TravelSeedMarker;
import de.jan.travel.TravelSeedMarkerDAO;
import de.jan.travel.TravelStop;
import de.jan.util.ListCache;
import org.springframework.stereotype.Component;

import java.text.Collator;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static de.jan.util.TextCleaner.cleanText;
import static de.jan.util.TextCleaner.collapse;

/**
 * The travel diary: folders (one per trip) and their photos. A photo is a TravelPhoto plus
 * a TravelPhotoFile with the image data, and a TravelPhotoPreview once its small version was asked for.
 */
@Component
public class TravelRepository {

    public static final int MAX_PHOTOS_PER_FOLDER = 200;

    /** The browser scales photos down to about 400 KB; the entity itself may be at most 1 MiB. */
    public static final long MAX_PHOTO_BYTES = 500L * 1024;

    /** Shorter side of the small version of a photo: fills a 256 px tile on screens with twice the pixel density. */
    public static final int PREVIEW_SIZE = 512;

    private static final int NAME_MAX_LENGTH = 80;
    public static final int CAPTION_MAX_LENGTH = 200;
    public static final int TEXT_MAX_LENGTH = 10_000;
    public static final int MAX_STOPS = 30;
    private static final Pattern MONTH = Pattern.compile("\\d{4}-(0[1-9]|1[0-2])");
    /** The sorted photos by their position, then the ones added since in the order they were added. */
    private static final Comparator<TravelPhoto> PHOTO_ORDER = Comparator
            .comparing(TravelPhoto::getPosition, Comparator.nullsLast(Comparator.naturalOrder()))
            .thenComparing(TravelPhoto::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder()))
            .thenComparing(TravelPhoto::getId);

    private final TravelFolderDAO folderDAO;
    private final TravelPhotoDAO photoDAO;
    private final TravelPhotoFileDAO fileDAO;
    private final TravelPhotoPreviewDAO previewDAO;
    private final TravelSeedMarkerDAO seedMarkerDAO;

    private final ListCache<TravelFolderDTO> cache = new ListCache<>(Duration.ofSeconds(60));

    public TravelRepository() {
        this.folderDAO = new TravelFolderDAO();
        this.photoDAO = new TravelPhotoDAO();
        this.fileDAO = new TravelPhotoFileDAO();
        this.previewDAO = new TravelPhotoPreviewDAO();
        this.seedMarkerDAO = new TravelSeedMarkerDAO();
    }

    /** All folders with their photos: the newest trip first, the ones without a date after them by name. */
    public List<TravelFolderDTO> getFolders() {
        return cache.get(this::loadFolders);
    }

    private List<TravelFolderDTO> loadFolders() {
        Map<Long, List<TravelPhoto>> photosByFolder = photoDAO.getAll().stream()
                .collect(Collectors.groupingBy(TravelPhoto::getFolderId));
        Collator collator = Collator.getInstance(Locale.GERMAN);
        Comparator<TravelFolder> newestFirst = Comparator.comparing(
                TravelFolder::getStartMonth, Comparator.nullsLast(Comparator.reverseOrder()));
        return folderDAO.getAll().stream()
                .sorted(newestFirst.thenComparing(TravelFolder::getName, collator))
                .map(folder -> toDTO(folder, photosByFolder.getOrDefault(folder.getId(), List.of())))
                .toList();
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

    /** Changes name, country, the months of the trip, the stops, the previous folder and the cuisine; the text stays. */
    public TravelFolderDTO updateFolder(Long id, TravelFolderRequest request) {
        TravelFolder folder = loadFolder(id);
        apply(folder, request);
        folderDAO.save(folder);
        invalidateCache();
        return getFolder(id);
    }

    /** Sets what the diary says about the trip; an empty text removes it. */
    public TravelFolderDTO setText(Long id, String text) {
        TravelFolder folder = loadFolder(id);
        String cleaned = cleanText(text);
        requireMaxLength(cleaned, TEXT_MAX_LENGTH, "Text");
        folder.setText(cleaned);
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
            previewDAO.delete(photo.getId());
        }
        if (!photos.isEmpty()) {
            photoDAO.deleteAll(photos);
        }
        folderDAO.delete(folder);

        // the trip no longer comes from here
        List<TravelFolder> following = folderDAO.getAll().stream()
                .filter(other -> id.equals(other.getPreviousFolderId()))
                .toList();
        following.forEach(other -> other.setPreviousFolderId(null));
        if (!following.isEmpty()) {
            folderDAO.saveAll(following);
        }
        invalidateCache();
    }

    /** Deletes every folder together with its photos, for restoring a backup. */
    public void deleteAllFolders() {
        for (TravelFolder folder : folderDAO.getAll()) {
            deleteFolder(folder.getId());
        }
    }

    /** Adds a photo at the end of the folder. The browser has scaled it down already. */
    public TravelFolderDTO addPhoto(Long folderId, byte[] data) {
        TravelFolder folder = loadFolder(folderId);
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

    /**
     * Puts the photos of a folder into a new order. The first one is then the photo shown on the folder,
     * so an earlier choice of another one ends.
     *
     * @param photoIds the ids of all photos of the folder, each one once
     */
    public TravelFolderDTO setPhotoOrder(Long folderId, List<Long> photoIds) {
        TravelFolder folder = loadFolder(folderId);
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
        if (folder.getCoverPhotoId() != null) {
            folder.setCoverPhotoId(null);
            folderDAO.save(folder);
        }
        invalidateCache();
        return getFolder(folderId);
    }

    /** Sets the text shown below a photo; an empty one removes it. Returns the folder of the photo. */
    public TravelFolderDTO setCaption(Long photoId, String caption) {
        TravelPhoto photo = loadPhoto(photoId);
        String text = collapse(caption);
        requireMaxLength(text, CAPTION_MAX_LENGTH, "Caption");
        photo.setCaption(text);
        photoDAO.save(photo);
        invalidateCache();
        return getFolder(photo.getFolderId());
    }

    public void deletePhoto(Long id) {
        TravelPhoto photo = loadPhoto(id);
        fileDAO.delete(id);
        previewDAO.delete(id);
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

    /**
     * The small version of a photo for the tiles: made from the photo the first time and stored from then on.
     * If the photo is that small already or can't be scaled, the photo itself (not stored). Null if there is no photo.
     */
    public TravelPhotoPreview getPhotoPreview(Long photoId) {
        TravelPhotoPreview stored = previewDAO.getById(photoId);
        if (stored != null) {
            return stored;
        }
        TravelPhotoFile file = fileDAO.getById(photoId);
        if (file == null) {
            return null;
        }
        byte[] scaled = ImageScaler.scaleDown(file.getData(), PREVIEW_SIZE);
        if (scaled == null) {
            return new TravelPhotoPreview(photoId, file.getData(), file.getContentType());
        }
        return previewDAO.save(new TravelPhotoPreview(photoId, scaled, ImageType.JPEG.contentType()));
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

    private TravelPhoto loadPhoto(Long id) {
        TravelPhoto photo = id == null ? null : photoDAO.getById(id);
        if (photo == null) {
            throw new EntityNotFoundException("Photo " + id + " not found");
        }
        return photo;
    }

    private static TravelFolderDTO toDTO(TravelFolder folder, Collection<TravelPhoto> photos) {
        return TravelFolderDTO.from(folder, photos.stream().sorted(PHOTO_ORDER).toList());
    }

    private void apply(TravelFolder folder, TravelFolderRequest request) {
        String name = collapse(request.name());
        if (name.isEmpty()) {
            throw new EntityStateException("Name must not be empty");
        }
        requireMaxLength(name, NAME_MAX_LENGTH, "Name");
        boolean taken = folderDAO.getAll().stream()
                .anyMatch(other -> !Objects.equals(other.getId(), folder.getId()) && other.getName().equalsIgnoreCase(name));
        if (taken) {
            throw new EntityStateException("A folder with this name already exists");
        }

        String country = collapse(request.country());
        requireMaxLength(country, NAME_MAX_LENGTH, "Country");

        List<TravelStop> stops = stops(request.stops());
        Long previousFolderId = request.previousFolderId();
        if (previousFolderId != null) {
            requirePreviousFolder(folder.getId(), previousFolderId);
        }

        String startMonth = month(request.startMonth(), "Start month");
        String endMonth = month(request.endMonth(), "End month");
        if (endMonth != null && startMonth == null) {
            throw new EntityStateException("An end month needs a start month");
        }
        if (endMonth != null && endMonth.compareTo(startMonth) < 0) {
            throw new EntityStateException("The end month must not be before the start month");
        }

        String cuisine = collapse(request.cuisine());
        requireMaxLength(cuisine, NAME_MAX_LENGTH, "Cuisine");

        folder.setName(name);
        folder.setCountry(country);
        folder.setCuisine(cuisine);
        folder.setStops(stops);
        folder.setPreviousFolderId(previousFolderId);
        // a trip within one month has no end month
        folder.setPeriod(startMonth, Objects.equals(startMonth, endMonth) ? null : endMonth);
    }

    /** The stops of a request, checked and cleaned up. */
    private static List<TravelStop> stops(List<TravelStopRequest> requests) {
        if (requests == null) {
            return List.of();
        }
        if (requests.size() > MAX_STOPS) {
            throw new EntityStateException("A folder can have at most " + MAX_STOPS + " stops");
        }
        List<TravelStop> stops = new ArrayList<>();
        for (TravelStopRequest stop : requests) {
            if (stop == null || stop.latitude() == null || stop.longitude() == null) {
                throw new EntityStateException("A stop needs a latitude and a longitude");
            }
            requireRange(stop.latitude(), 90, "Latitude");
            requireRange(stop.longitude(), 180, "Longitude");
            String name = collapse(stop.name());
            requireMaxLength(name, NAME_MAX_LENGTH, "Stop name");
            stops.add(new TravelStop(name, stop.latitude(), stop.longitude()));
        }
        return stops;
    }

    /**
     * The folder the trip came from must exist, and following the trip back from it must not lead to
     * the folder itself, which would make the trip go in a circle.
     *
     * @param folderId null for a new folder
     */
    private void requirePreviousFolder(Long folderId, Long previousFolderId) {
        if (previousFolderId.equals(folderId)) {
            throw new EntityStateException("A folder cannot come from itself");
        }
        Map<Long, Long> previousOf = new HashMap<>();
        for (TravelFolder other : folderDAO.getAll()) {
            previousOf.put(other.getId(), other.getPreviousFolderId());
        }
        if (!previousOf.containsKey(previousFolderId)) {
            throw new EntityStateException("The previous folder does not exist");
        }
        if (folderId == null) {
            return;
        }
        Long current = previousFolderId;
        // at most once through all folders, even if stored data were already circular
        for (int steps = 0; current != null && steps <= previousOf.size(); steps++) {
            if (current.equals(folderId)) {
                throw new EntityStateException("The trip would go in a circle");
            }
            current = previousOf.get(current);
        }
    }

    /** A year and a month like "2024-05", which also sorts by time; null if none is given. */
    private static String month(String value, String label) {
        String month = value == null ? "" : value.trim();
        if (month.isEmpty()) {
            return null;
        }
        if (!MONTH.matcher(month).matches()) {
            throw new EntityStateException(label + " must be a year and a month like 2024-05");
        }
        return month;
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
        cache.invalidate();
    }

    /** NaN and infinite values are out of range as well. */
    private static void requireRange(double value, int limit, String label) {
        if (!(Math.abs(value) <= limit)) {
            throw new EntityStateException(label + " must be between -" + limit + " and " + limit);
        }
    }

    private static void requireMaxLength(String value, int maxLength, String label) {
        if (value.length() > maxLength) {
            throw new EntityStateException(label + " must be at most " + maxLength + " characters long");
        }
    }
}
