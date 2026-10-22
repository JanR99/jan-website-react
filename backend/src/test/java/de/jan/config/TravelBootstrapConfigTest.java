package de.jan.config;

import de.jan.controller.requests.TravelFolderRequest;
import de.jan.testsupport.ControllerTest;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.repository.TravelRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** The travel import on startup, with the seed data of src/test/resources/bootstrap and the real photos. */
class TravelBootstrapConfigTest extends ControllerTest {

    private static final String IMAGES = "travel/images/";

    @Autowired
    private TravelRepository travelRepository;

    private void bootstrap(String seedFile) {
        new TravelBootstrapConfig(travelRepository, objectMapper, seedFile, IMAGES).afterSingletonsInstantiated();
    }

    private Map<String, TravelFolderDTO> foldersByName() {
        return inDatastore(() -> travelRepository.getFolders()).stream()
                .collect(Collectors.toMap(TravelFolderDTO::name, Function.identity()));
    }

    private boolean imported() {
        return inDatastore(() -> travelRepository.isSeedImported());
    }

    @Test
    void importsFoldersAndPhotos_andTriesTheFailedOnesAgainLater() {
        TravelFolderRequest existing = new TravelFolderRequest();
        existing.setName("Schon da");
        existing.setCountry("Portugal");
        inDatastore(() -> travelRepository.createFolder(existing));

        bootstrap("bootstrap/folders.json");

        Map<String, TravelFolderDTO> folders = foldersByName();
        // a seed without a name is left out; folders whose photos fail are there, without them
        assertEquals(5, folders.size());
        assertEquals(1, folders.get("Schon da").photos().size());
        assertEquals(1, folders.get("Neu").photos().size());
        assertEquals(1, folders.get("Neu").stops().size());
        assertTrue(folders.get("Ohne Fotos").photos().isEmpty());
        assertTrue(folders.get("Falscher Dateiname").photos().isEmpty());
        assertTrue(folders.get("Fehlendes Foto").photos().isEmpty());
        assertFalse(imported());
    }

    @Test
    void allImported_marksTheImportDone_soItNeverRunsAgain() {
        bootstrap("bootstrap/folders-complete.json");
        bootstrap("bootstrap/folders-complete.json");

        assertTrue(imported());
        assertEquals(1, foldersByName().get("Einzige Reise").photos().size());
    }

    @Test
    void withoutSeedFile_importsNothing() {
        bootstrap("bootstrap/missing.json");

        assertTrue(foldersByName().isEmpty());
        assertFalse(imported());
    }

    @Test
    void brokenSeedFile_doesNotStopTheStart() {
        assertDoesNotThrow(() -> bootstrap("bootstrap/broken.json"));

        assertTrue(foldersByName().isEmpty());
        assertFalse(imported());
    }
}
