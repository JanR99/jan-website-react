package de.jan.travel;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.jan.config.TravelBootstrapConfig.SeedFolder;
import de.jan.image.ImageType;
import de.jan.travel.repository.TravelRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Checks the seed data in resources/travel (folders.json and the images) the way the
 * import on startup needs it. Needs no database.
 * <p>
 * Reads the files from src/main/resources and not from the classpath: target/classes keeps images
 * that were deleted or renamed in the sources until the next "mvn clean", so a missing image would
 * go unnoticed here and only make the import fail on a fresh build, i.e. after the deploy.
 */
class TravelSeedDataTest {

    private static final Path SEED_DIR = seedDir();
    private static final Path SEED_FILE = SEED_DIR.resolve("folders.json");
    private static final Path SEED_IMAGE_DIR = SEED_DIR.resolve("images");

    private static List<SeedFolder> seeds;
    /** names exactly as they are written; Windows would also find "prag1.jpg", the server would not */
    private static Set<String> imageFiles;

    @BeforeAll
    static void loadSeeds() throws IOException {
        assertTrue(Files.isRegularFile(SEED_FILE), SEED_FILE + " is missing");
        try (InputStream in = Files.newInputStream(SEED_FILE)) {
            seeds = new ObjectMapper().readValue(in, new TypeReference<>() {});
        }
        assertTrue(Files.isDirectory(SEED_IMAGE_DIR), SEED_IMAGE_DIR + " is missing");
        try (Stream<Path> files = Files.list(SEED_IMAGE_DIR)) {
            imageFiles = files.map(file -> file.getFileName().toString()).collect(Collectors.toSet());
        }
    }

    @Test
    void containsFolders() {
        assertFalse(seeds.isEmpty(), "folders.json contains no folders");
    }

    @Test
    void everyFolderHasAUniqueName() {
        // the import finds the folders of an interrupted start by their name
        List<String> problems = new ArrayList<>();
        Set<String> names = new HashSet<>();
        for (SeedFolder seed : seeds) {
            if (isBlank(seed.name())) {
                problems.add("a folder has no name");
            } else if (!names.add(seed.name().trim().toLowerCase(Locale.ROOT))) {
                problems.add("\"" + seed.name() + "\" exists more than once");
            }
        }
        assertNoProblems(problems);
    }

    @Test
    void everyPositionIsComplete() {
        List<String> problems = new ArrayList<>();
        for (SeedFolder seed : seeds) {
            String name = "\"" + seed.name() + "\"";
            Double latitude = seed.latitude();
            Double longitude = seed.longitude();
            if ((latitude == null) != (longitude == null)) {
                problems.add(name + " has only one of latitude and longitude");
            } else if (latitude != null && !(Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180)) {
                problems.add(name + " has a position that is out of range: " + latitude + ", " + longitude);
            }
        }
        assertNoProblems(problems);
    }

    @Test
    void everyPhotoExistsAndCanBeStored() throws IOException {
        List<String> problems = new ArrayList<>();
        for (SeedFolder seed : seeds) {
            if (seed.photos() == null) {
                continue;
            }
            for (String photo : seed.photos()) {
                String name = "\"" + seed.name() + "\": photo " + photo;
                if (isBlank(photo) || photo.contains("/") || photo.contains("..")) {
                    problems.add(name + " is not a plain file name");
                    continue;
                }
                if (!imageFiles.contains(photo)) {
                    problems.add(name + " is missing in resources/travel/images");
                    continue;
                }
                byte[] data = Files.readAllBytes(SEED_IMAGE_DIR.resolve(photo));
                if (data.length > TravelRepository.MAX_PHOTO_BYTES) {
                    problems.add(name + " is too large (" + data.length / 1024 + " KB)");
                }
                try {
                    ImageType.detect(data);
                } catch (RuntimeException e) {
                    problems.add(name + " is not a JPEG, PNG or WebP image");
                }
            }
        }
        assertNoProblems(problems);
    }

    /** Maven runs the tests in the backend module; an IDE may run them in the project root. */
    private static Path seedDir() {
        Path dir = Path.of("src", "main", "resources", "travel");
        return Files.isDirectory(dir) ? dir : Path.of("backend").resolve(dir);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static void assertNoProblems(List<String> problems) {
        assertTrue(problems.isEmpty(), () -> problems.size() + " problem(s):\n" + String.join("\n", problems));
    }
}
