package de.jan.travel.repository;

import de.jan.controller.requests.TravelFolderRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.testsupport.ControllerTest;
import de.jan.travel.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/** What the travel controller tests don't reach: the cache, a full folder and a photo file that can't be stored. */
class TravelFolderRepositoryTest extends ControllerTest {

    // the first bytes are enough for the type check
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 1, 2, 3};

    @Autowired
    private TravelFolderRepository travelRepository;

    @Autowired
    private TravelPhotoPreviewRepository previewRepository;

    private TravelFolderDTO folder(TravelFolderRepository repository, String name) {
        TravelFolderRequest request = new TravelFolderRequest(name, "Japan");
        return inDatastore(() -> repository.createFolder(request));
    }

    @Test
    void folders_areCachedForAWhile() {
        TravelFolderDTO tokio = folder(travelRepository, "Tokio");
        assertEquals(1, inDatastore(() -> travelRepository.getFolders()).size());

        // past the repository, so the cache doesn't know about it
        inDatastore(() -> {
            new TravelFolderDAO().delete(tokio.id());
            return null;
        });

        assertEquals(1, inDatastore(() -> travelRepository.getFolders()).size());
    }

    @Test
    void fullFolder_takesNoMorePhotos() {
        TravelFolderDTO tokio = folder(travelRepository, "Tokio");
        List<TravelPhoto> photos = new ArrayList<>();
        for (int i = 0; i < TravelPhotoRepository.MAX_PHOTOS_PER_FOLDER; i++) {
            photos.add(new TravelPhoto(tokio.id(), new Date(i)));
        }
        inDatastore(() -> {
            new TravelPhotoDAO().saveAll(photos);
            return null;
        });

        EntityStateException e = assertThrows(EntityStateException.class,
                () -> inDatastore(() -> travelRepository.addPhoto(tokio.id(), JPEG)));
        assertEquals("A folder can have at most 200 photos", e.getMessage());
    }

    @Test
    void photoFileThatCannotBeStored_takesThePhotoOutAgain() {
        TravelPhotoFileRepository files = mock(TravelPhotoFileRepository.class);
        RuntimeException failure = new IllegalStateException("entity too large");
        doThrow(failure).when(files).save(anyLong(), any(), anyString());
        TravelFolderRepository repository = withFiles(files);
        TravelFolderDTO tokio = folder(repository, "Tokio");

        RuntimeException e = assertThrows(RuntimeException.class, () -> inDatastore(() -> repository.addPhoto(tokio.id(), JPEG)));

        assertSame(failure, e);
        assertTrue(inDatastore(() -> new TravelPhotoDAO().getByFolderId(tokio.id())).isEmpty());
    }

    @Test
    void failingCleanUp_stillReportsTheFirstError() {
        TravelPhotoFileRepository files = mock(TravelPhotoFileRepository.class);
        RuntimeException failure = new IllegalStateException("entity too large");
        doThrow(failure).when(files).save(anyLong(), any(), anyString());
        doThrow(new IllegalStateException("database down")).when(files).delete(anyLong());
        TravelFolderRepository repository = withFiles(files);
        TravelFolderDTO tokio = folder(repository, "Tokio");

        RuntimeException e = assertThrows(RuntimeException.class, () -> inDatastore(() -> repository.addPhoto(tokio.id(), JPEG)));

        assertSame(failure, e);
    }

    /** The repositories as Spring builds them, but with these photo files. */
    private TravelFolderRepository withFiles(TravelPhotoFileRepository files) {
        return new TravelFolderRepository(new TravelPhotoRepository(files, previewRepository));
    }
}
