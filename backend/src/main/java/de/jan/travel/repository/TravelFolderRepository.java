package de.jan.travel.repository;

import de.jan.controller.requests.TravelFolderRequest;
import de.jan.controller.requests.TravelStopRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.travel.TravelFolder;
import de.jan.travel.TravelFolderDAO;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.TravelPhoto;
import de.jan.travel.TravelStop;
import de.jan.util.ListCache;
import de.jan.util.TextRules;
import org.springframework.stereotype.Component;

import java.text.Collator;
import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;

import static de.jan.util.TextCleaner.cleanText;
import static de.jan.util.TextCleaner.collapse;

/**
 * The folders of the travel diary, one per trip. The folder is the way in for everything that belongs to it:
 * changes to its photos go through here, so the cover and the cached list stay right.
 */
@Component
public class TravelFolderRepository {

    private static final int NAME_MAX_LENGTH = 80;
    public static final int TEXT_MAX_LENGTH = 10_000;
    public static final int MAX_STOPS = 30;
    private static final Pattern MONTH = Pattern.compile("\\d{4}-(0[1-9]|1[0-2])");

    private final TravelFolderDAO folderDAO = new TravelFolderDAO();
    private final TravelPhotoRepository photoRepository;

    private final ListCache<TravelFolderDTO> cache = new ListCache<>(Duration.ofSeconds(60));

    public TravelFolderRepository(TravelPhotoRepository photoRepository) {
        this.photoRepository = photoRepository;
    }

    /** All folders with their photos: the newest trip first, the ones without a date after them by name. */
    public List<TravelFolderDTO> getFolders() {
        return cache.get(this::loadFolders);
    }

    private List<TravelFolderDTO> loadFolders() {
        Map<Long, List<TravelPhoto>> photosByFolder = photoRepository.getAllByFolder();
        Collator collator = Collator.getInstance(Locale.GERMAN);
        Comparator<TravelFolder> newestFirst = Comparator.comparing(
                TravelFolder::getStartMonth, Comparator.nullsLast(Comparator.reverseOrder()));
        return folderDAO.getAll().stream()
                .sorted(newestFirst.thenComparing(TravelFolder::getName, collator))
                .map(folder -> TravelFolderDTO.from(folder, photosByFolder.getOrDefault(folder.getId(), List.of())))
                .toList();
    }

    /** One folder, read from the database and not from the cache. */
    public TravelFolderDTO getFolder(Long id) {
        TravelFolder folder = loadFolder(id);
        return TravelFolderDTO.from(folder, photoRepository.getByFolder(folder.getId()));
    }

    public TravelFolderDTO createFolder(TravelFolderRequest request) {
        TravelFolder folder = new TravelFolder();
        folder.setCreatedAt(new Date());
        apply(folder, request);
        TravelFolder saved = folderDAO.save(folder);
        invalidateCache();
        return TravelFolderDTO.from(saved, List.of());
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
        TextRules.requireMaxLength(cleaned, "Text", TEXT_MAX_LENGTH);
        folder.setText(cleaned);
        folderDAO.save(folder);
        invalidateCache();
        return getFolder(id);
    }

    /** Chooses the photo shown on the folder; null means the first photo again. */
    public TravelFolderDTO setCover(Long id, Long photoId) {
        TravelFolder folder = loadFolder(id);
        if (photoId != null) {
            TravelPhoto photo = photoRepository.get(photoId);
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
        photoRepository.deleteAllOf(id);
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

    /** Adds a photo at the end of the folder. */
    public TravelFolderDTO addPhoto(Long folderId, byte[] data) {
        loadFolder(folderId);
        try {
            photoRepository.add(folderId, data);
        } finally {
            invalidateCache();
        }
        return getFolder(folderId);
    }

    /** Puts the photos into a new order. The first one is then the cover, so an earlier choice of another one ends. */
    public TravelFolderDTO setPhotoOrder(Long folderId, List<Long> photoIds) {
        TravelFolder folder = loadFolder(folderId);
        photoRepository.setOrder(folderId, photoIds);
        if (folder.getCoverPhotoId() != null) {
            folder.setCoverPhotoId(null);
            folderDAO.save(folder);
        }
        invalidateCache();
        return getFolder(folderId);
    }

    /** Returns the folder of the photo. */
    public TravelFolderDTO setCaption(Long photoId, String caption) {
        TravelPhoto photo = photoRepository.setCaption(photoId, caption);
        invalidateCache();
        return getFolder(photo.getFolderId());
    }

    public void deletePhoto(Long id) {
        TravelPhoto photo = photoRepository.delete(id);
        TravelFolder folder = folderDAO.get(photo.getFolderId());
        if (folder != null && id.equals(folder.getCoverPhotoId())) {
            folder.setCoverPhotoId(null);
            folderDAO.save(folder);
        }
        invalidateCache();
    }

    private TravelFolder loadFolder(Long id) {
        return folderDAO.getOrThrow(id);
    }

    private void apply(TravelFolder folder, TravelFolderRequest request) {
        String name = collapse(request.name());
        TextRules.require(name, "Name", NAME_MAX_LENGTH);
        boolean taken = folderDAO.getAll().stream()
                .anyMatch(other -> !Objects.equals(other.getId(), folder.getId()) && other.getName().equalsIgnoreCase(name));
        if (taken) {
            throw new EntityStateException("A folder with this name already exists");
        }

        String country = collapse(request.country());
        TextRules.requireMaxLength(country, "Country", NAME_MAX_LENGTH);

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
        TextRules.requireMaxLength(cuisine, "Cuisine", NAME_MAX_LENGTH);

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
            TextRules.requireMaxLength(name, "Stop name", NAME_MAX_LENGTH);
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

    private void invalidateCache() {
        cache.invalidate();
    }

    /** NaN and infinite values are out of range as well. */
    private static void requireRange(double value, int limit, String label) {
        if (!(Math.abs(value) <= limit)) {
            throw new EntityStateException(label + " must be between -" + limit + " and " + limit);
        }
    }
}
