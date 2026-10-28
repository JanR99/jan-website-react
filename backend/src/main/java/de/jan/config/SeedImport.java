package de.jan.config;

import com.googlecode.objectify.ObjectifyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.core.io.ClassPathResource;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.List;

/**
 * Imports seed data from the classpath on startup: a JSON list plus the images it names. It runs until
 * everything is in the database, then a marker is stored and the import never runs again (so an interrupted
 * import continues on the next start, and things deleted later don't come back). The subclasses only import.
 * <p>
 * Runs in afterSingletonsInstantiated, i.e. before the web server accepts requests: Cloud Run gives
 * the instance full CPU while it starts, but throttles it between requests once it is running.
 *
 * @param <T> one entry of the JSON list
 */
abstract class SeedImport<T> implements SmartInitializingSingleton {

    private static final Logger log = LoggerFactory.getLogger(SeedImport.class);

    private final ObjectMapper objectMapper;
    private final TypeReference<List<T>> seedType;
    private final String seedFile;
    private final String seedImageDir;
    /** what is imported, for the log, e.g. "recipe" */
    private final String what;

    protected SeedImport(ObjectMapper objectMapper, TypeReference<List<T>> seedType,
                         String seedFile, String seedImageDir, String what) {
        this.objectMapper = objectMapper;
        this.seedType = seedType;
        this.seedFile = seedFile;
        this.seedImageDir = seedImageDir;
        this.what = what;
    }

    /** Whether everything was imported before, see markImported. */
    protected abstract boolean isImported();

    protected abstract void markImported();

    /**
     * Imports what is not in the database yet.
     *
     * @return whether everything is there now; if not, the import runs again on the next start
     */
    protected abstract boolean importSeeds(List<T> seeds);

    /** Runs after the import on every start, also when there was nothing to import; nothing by default. */
    protected void afterImport() {
    }

    @Override
    public final void afterSingletonsInstantiated() {
        ObjectifyService.run(() -> {
            try {
                if (!isImported()) {
                    runImport();
                }
            } catch (Exception e) {
                log.error("Bootstrap: {} import failed: {}", what, e.getMessage());
            }
            afterImport();
            return null;
        });
    }

    private void runImport() throws Exception {
        ClassPathResource resource = new ClassPathResource(seedFile);
        if (!resource.exists()) {
            log.info("Bootstrap: no {} found, skipping {} import.", seedFile, what);
            return;
        }
        List<T> seeds;
        try (InputStream in = resource.getInputStream()) {
            seeds = objectMapper.readValue(in, seedType);
        }
        if (importSeeds(seeds)) {
            markImported();
        }
    }

    /** The bytes of an image of the seed data, a file name in the image directory. */
    protected byte[] readImage(String fileName) throws Exception {
        if (fileName == null || fileName.isBlank() || fileName.contains("/") || fileName.contains("..")) {
            throw new IllegalArgumentException("invalid file name " + fileName);
        }
        ClassPathResource resource = new ClassPathResource(seedImageDir + fileName);
        if (!resource.exists()) {
            throw new IllegalArgumentException(seedImageDir + fileName + " not found");
        }
        try (InputStream in = resource.getInputStream()) {
            return in.readAllBytes();
        }
    }
}
