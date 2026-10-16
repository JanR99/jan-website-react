package de.jan.travel.repository;

import de.jan.controller.requests.TravelFolderRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.testsupport.ControllerTest;
import de.jan.travel.TravelFolderDAO;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.TravelPhoto;
import de.jan.travel.TravelPhotoDAO;
import de.jan.travel.TravelPhotoFile;
import de.jan.travel.TravelPhotoFileDAO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** What the travel controller tests don't reach: the cache, a full folder and a photo file that can't be stored. */
class TravelRepositoryTest extends ControllerTest {

    // the first bytes are enough for the type check
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 1, 2, 3};

    @Autowired
    private TravelRepository travelRepository;

    private TravelFolderDTO folder(TravelRepository repository, String name) {
        TravelFolderRequest request = new TravelFolderRequest();
        request.setName(name);
        request.setCountry("Japan");
        return inDatastore(() -> repository.createFolder(request));
    }

    @Test
    void folders_areCachedForAWhile() {
        TravelFolderDTO tokio = folder(travelRepository, "Tokio");
        assertEquals(1, inDatastore(() -> travelRepository.getFolders()).size());

        // past the repository, so the cache doesn't know about it
        inDatastore(() -> {
            new TravelFolderDAO().delete(tokio.getId());
            return null;
        });

        assertEquals(1, inDatastore(() -> travelRepository.getFolders()).size());
    }

    @Test
    void fullFolder_takesNoMorePhotos() {
        TravelFolderDTO tokio = folder(travelRepository, "Tokio");
        List<TravelPhoto> photos = new ArrayList<>();
        for (int i = 0; i < TravelRepository.MAX_PHOTOS_PER_FOLDER; i++) {
            photos.add(new TravelPhoto(tokio.getId(), new Date(i)));
        }
        inDatastore(() -> {
            new TravelPhotoDAO().saveAll(photos);
            return null;
        });

        EntityStateException e = assertThrows(EntityStateException.class,
                () -> inDatastore(() -> travelRepository.addPhoto(tokio.getId(), JPEG)));
        assertEquals("A folder can have at most 200 photos", e.getMessage());
    }

    @Test
    void photoFileThatCannotBeStored_takesThePhotoOutAgain() {
        TravelRepository repository = new TravelRepository();
        TravelPhotoFileDAO files = mock(TravelPhotoFileDAO.class);
        RuntimeException failure = new IllegalStateException("entity too large");
        when(files.save(any(TravelPhotoFile.class))).thenThrow(failure);
        ReflectionTestUtils.setField(repository, "fileDAO", files);
        TravelFolderDTO tokio = folder(repository, "Tokio");

        RuntimeException e = assertThrows(RuntimeException.class, () -> inDatastore(() -> repository.addPhoto(tokio.getId(), JPEG)));

        assertSame(failure, e);
        assertTrue(inDatastore(() -> new TravelPhotoDAO().getByFolderId(tokio.getId())).isEmpty());
    }

    @Test
    void failingCleanUp_stillReportsTheFirstError() {
        TravelRepository repository = new TravelRepository();
        TravelPhotoFileDAO files = mock(TravelPhotoFileDAO.class);
        RuntimeException failure = new IllegalStateException("entity too large");
        when(files.save(any(TravelPhotoFile.class))).thenThrow(failure);
        doThrow(new IllegalStateException("database down")).when(files).delete(anyLong());
        ReflectionTestUtils.setField(repository, "fileDAO", files);
        TravelFolderDTO tokio = folder(repository, "Tokio");

        RuntimeException e = assertThrows(RuntimeException.class, () -> inDatastore(() -> repository.addPhoto(tokio.getId(), JPEG)));

        assertSame(failure, e);
    }
}
