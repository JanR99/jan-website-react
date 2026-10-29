package de.jan.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import de.jan.controller.requests.TravelFolderRequest;
import de.jan.controller.requests.TravelStopRequest;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.repository.TravelFolderRepository;
import de.jan.travel.repository.TravelSeedMarkerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * On startup, imports the folders of resources/travel/folders.json with their photos
 * (resources/travel/images) until all of them are in the database, marked by a TravelSeedMarker (see SeedImport).
 */
@Configuration
public class TravelBootstrapConfig extends SeedImport<TravelBootstrapConfig.SeedFolder> {

    private static final Logger log = LoggerFactory.getLogger(TravelBootstrapConfig.class);

    private static final String SEED_FILE = "travel/folders.json";
    private static final String SEED_IMAGE_DIR = "travel/images/";

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SeedFolder(String name, String country, Double latitude, Double longitude, List<String> photos) {
    }

    private final TravelFolderRepository travelRepository;
    private final TravelSeedMarkerRepository seedMarkerRepository;

    @Autowired
    public TravelBootstrapConfig(TravelFolderRepository travelRepository, TravelSeedMarkerRepository seedMarkerRepository,
                                 ObjectMapper objectMapper) {
        this(travelRepository, seedMarkerRepository, objectMapper, SEED_FILE, SEED_IMAGE_DIR);
    }

    /** With other seed data on the classpath, for tests. */
    TravelBootstrapConfig(TravelFolderRepository travelRepository, TravelSeedMarkerRepository seedMarkerRepository,
                          ObjectMapper objectMapper, String seedFile, String seedImageDir) {
        super(objectMapper, new TypeReference<>() {}, seedFile, seedImageDir, "travel");
        this.travelRepository = travelRepository;
        this.seedMarkerRepository = seedMarkerRepository;
    }

    @Override
    protected boolean isImported() {
        return seedMarkerRepository.isImported();
    }

    @Override
    protected void markImported() {
        seedMarkerRepository.markImported();
    }

    @Override
    protected boolean importSeeds(List<SeedFolder> seeds) {
        Map<String, TravelFolderDTO> byName = new HashMap<>();
        for (TravelFolderDTO folder : travelRepository.getFolders()) {
            byName.put(key(folder.name()), folder);
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
                    TravelFolderRequest request = new TravelFolderRequest(seed.name(), seed.country());
                    if (seed.latitude() != null && seed.longitude() != null) {
                        request = request.withStops(List.of(new TravelStopRequest(seed.name(), seed.latitude(), seed.longitude())));
                    }
                    folder = travelRepository.createFolder(request);
                }
                // photos are imported in order, so the ones an interrupted start already stored are skipped
                for (int i = folder.photos().size(); i < photos.size(); i++) {
                    travelRepository.addPhoto(folder.id(), readImage(photos.get(i)));
                    imported++;
                }
            } catch (Exception e) {
                failed++;
                log.warn("Bootstrap: travel folder \"{}\" not fully imported: {}", seed.name(), e.getMessage());
            }
        }

        log.info("Bootstrap: imported {} travel photos into {} folders, {} folders failed.", imported, seeds.size(), failed);

        // failed folders are continued on the next start
        return failed == 0;
    }

    private static String key(String name) {
        return name.trim().toLowerCase(Locale.ROOT);
    }
}
