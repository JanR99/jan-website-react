package de.jan.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.googlecode.objectify.ObjectifyService;
import de.jan.controller.requests.TravelFolderRequest;
import de.jan.controller.requests.TravelStopRequest;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.repository.TravelRepository;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * On startup, imports the folders of resources/travel/folders.json with their photos
 * (resources/travel/images) until all of them are in the database; then a TravelSeedMarker
 * is stored and the import never runs again
 * (so an interrupted import continues on the next start, and things deleted later don't come back).
 * <p>
 * Runs in afterSingletonsInstantiated, i.e. before the web server accepts requests, see RecipeBootstrapConfig.
 */
@Configuration
public class TravelBootstrapConfig implements SmartInitializingSingleton {

    private static final String SEED_FILE = "travel/folders.json";
    private static final String SEED_IMAGE_DIR = "travel/images/";

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SeedFolder(String name, String country, Double latitude, Double longitude, List<String> photos) {
    }

    private final TravelRepository travelRepository;
    private final ObjectMapper objectMapper;

    public TravelBootstrapConfig(TravelRepository travelRepository, ObjectMapper objectMapper) {
        this.travelRepository = travelRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterSingletonsInstantiated() {
        ObjectifyService.run(() -> {
            try {
                if (!travelRepository.isSeedImported()) {
                    importSeed();
                }
            } catch (Exception e) {
                System.out.println("Bootstrap: travel import failed: " + e.getMessage());
            }
            return null;
        });
    }

    private void importSeed() throws Exception {
        ClassPathResource resource = new ClassPathResource(SEED_FILE);
        if (!resource.exists()) {
            System.out.println("Bootstrap: no " + SEED_FILE + " found, skipping travel import.");
            return;
        }

        List<SeedFolder> seeds;
        try (InputStream in = resource.getInputStream()) {
            seeds = objectMapper.readValue(in, new TypeReference<>() {});
        }

        Map<String, TravelFolderDTO> byName = new HashMap<>();
        for (TravelFolderDTO folder : travelRepository.getFolders()) {
            byName.put(key(folder.getName()), folder);
        }

        int imported = 0;
        int failed = 0;
        for (SeedFolder seed : seeds) {
            if (seed.name() == null) {
                continue;
            }
            List<String> photos = seed.photos() == null ? List.of() : seed.photos();
            try {
                TravelFolderDTO folder = byName.get(key(seed.name()));
                if (folder == null) {
                    TravelFolderRequest request = new TravelFolderRequest();
                    request.setName(seed.name());
                    request.setCountry(seed.country());
                    if (seed.latitude() != null && seed.longitude() != null) {
                        request.setStops(List.of(new TravelStopRequest(seed.name(), seed.latitude(), seed.longitude())));
                    }
                    folder = travelRepository.createFolder(request);
                }
                // photos are imported in order, so the ones an interrupted start already stored are skipped
                for (int i = folder.getPhotos().size(); i < photos.size(); i++) {
                    travelRepository.addPhoto(folder.getId(), readImage(photos.get(i)));
                    imported++;
                }
            } catch (Exception e) {
                failed++;
                System.out.println("Bootstrap: travel folder \"" + seed.name() + "\" not fully imported: " + e.getMessage());
            }
        }

        System.out.println("Bootstrap: imported " + imported + " travel photos into " + seeds.size()
                + " folders, " + failed + " folders failed.");

        // failed folders are continued on the next start; once everything is there, never again
        if (failed == 0) {
            travelRepository.markSeedImported();
        }
    }

    private static byte[] readImage(String fileName) throws Exception {
        if (fileName == null || fileName.isBlank() || fileName.contains("/") || fileName.contains("..")) {
            throw new IllegalArgumentException("invalid file name " + fileName);
        }
        ClassPathResource resource = new ClassPathResource(SEED_IMAGE_DIR + fileName);
        if (!resource.exists()) {
            throw new IllegalArgumentException(SEED_IMAGE_DIR + fileName + " not found");
        }
        try (InputStream in = resource.getInputStream()) {
            return in.readAllBytes();
        }
    }

    private static String key(String name) {
        return name.trim().toLowerCase(Locale.ROOT);
    }
}
