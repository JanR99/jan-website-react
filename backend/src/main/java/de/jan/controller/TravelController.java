package de.jan.controller;

import de.jan.controller.requests.TravelFolderRequest;
import de.jan.controller.requests.TravelFolderTextRequest;
import de.jan.controller.requests.TravelPhotoCaptionRequest;
import de.jan.role.Permission;
import de.jan.security.Authorization;
import de.jan.security.CurrentUser;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.TravelPhotoFile;
import de.jan.travel.repository.TravelRepository;
import de.jan.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

/**
 * The travel diary: folders with photos. Reading is public, changing requires an admin.
 */
@Tag(name = "travel")
@RestController
@RequestMapping("/api/travel")
public class TravelController {

    private final TravelRepository travelRepository;

    private static final String LIST_TRAVEL_FOLDERS = "listTravelFolders";
    private static final String CREATE_TRAVEL_FOLDER = "createTravelFolder";
    private static final String UPDATE_TRAVEL_FOLDER = "updateTravelFolder";
    private static final String SET_TRAVEL_FOLDER_TEXT = "setTravelFolderText";
    private static final String SET_TRAVEL_FOLDER_COVER = "setTravelFolderCover";
    private static final String DELETE_TRAVEL_FOLDER = "deleteTravelFolder";
    private static final String UPLOAD_TRAVEL_PHOTO = "uploadTravelPhoto";
    private static final String SET_TRAVEL_PHOTO_CAPTION = "setTravelPhotoCaption";
    private static final String DELETE_TRAVEL_PHOTO = "deleteTravelPhoto";
    private static final String GET_TRAVEL_PHOTO = "getTravelPhoto";

    public TravelController(TravelRepository travelRepository) {
        this.travelRepository = travelRepository;
    }

    @Operation(operationId = LIST_TRAVEL_FOLDERS)
    @GetMapping("/folders/list")
    public ResponseEntity<List<TravelFolderDTO>> listTravelFolders() {
        return ResponseEntity.ok(travelRepository.getFolders());
    }

    @Operation(operationId = CREATE_TRAVEL_FOLDER)
    @PostMapping("/folders/create")
    public ResponseEntity<TravelFolderDTO> createTravelFolder(
            @CurrentUser User user,
            @RequestBody TravelFolderRequest body
    ) {
        Authorization.with(user).require(Permission.MANAGE_TRAVEL);
        return ResponseEntity.ok(travelRepository.createFolder(body));
    }

    @Operation(operationId = UPDATE_TRAVEL_FOLDER)
    @PostMapping("/folders/update")
    public ResponseEntity<TravelFolderDTO> updateTravelFolder(
            @CurrentUser User user,
            @RequestParam("id") Long id,
            @RequestBody TravelFolderRequest body
    ) {
        Authorization.with(user).require(Permission.MANAGE_TRAVEL);
        return ResponseEntity.ok(travelRepository.updateFolder(id, body));
    }

    /** The diary text of the trip; an empty one removes it. */
    @Operation(operationId = SET_TRAVEL_FOLDER_TEXT)
    @PostMapping("/folders/setText")
    public ResponseEntity<TravelFolderDTO> setTravelFolderText(
            @CurrentUser User user,
            @RequestParam("id") Long id,
            @RequestBody TravelFolderTextRequest body
    ) {
        Authorization.with(user).require(Permission.MANAGE_TRAVEL);
        return ResponseEntity.ok(travelRepository.setText(id, body.getText()));
    }

    /** Without photoId the folder shows its first photo again. */
    @Operation(operationId = SET_TRAVEL_FOLDER_COVER)
    @PostMapping("/folders/setCover")
    public ResponseEntity<TravelFolderDTO> setTravelFolderCover(
            @CurrentUser User user,
            @RequestParam("id") Long id,
            @RequestParam(value = "photoId", required = false) Long photoId
    ) {
        Authorization.with(user).require(Permission.MANAGE_TRAVEL);
        return ResponseEntity.ok(travelRepository.setCover(id, photoId));
    }

    @Operation(operationId = DELETE_TRAVEL_FOLDER)
    @PostMapping("/folders/delete")
    public ResponseEntity<Void> deleteTravelFolder(
            @CurrentUser User user,
            @RequestParam("id") Long id
    ) {
        Authorization.with(user).require(Permission.MANAGE_TRAVEL);
        travelRepository.deleteFolder(id);
        return ResponseEntity.noContent().build();
    }

    /** The browser scales the photo down first; returns the folder with the new photo. */
    @Operation(operationId = UPLOAD_TRAVEL_PHOTO)
    @PostMapping(value = "/photos/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TravelFolderDTO> uploadTravelPhoto(
            @CurrentUser User user,
            @RequestParam("folderId") Long folderId,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        Authorization.with(user).require(Permission.MANAGE_TRAVEL);
        return ResponseEntity.ok(travelRepository.addPhoto(folderId, file.getBytes()));
    }

    /** An empty caption removes it; returns the folder of the photo. */
    @Operation(operationId = SET_TRAVEL_PHOTO_CAPTION)
    @PostMapping("/photos/setCaption")
    public ResponseEntity<TravelFolderDTO> setTravelPhotoCaption(
            @CurrentUser User user,
            @RequestParam("id") Long id,
            @RequestBody TravelPhotoCaptionRequest body
    ) {
        Authorization.with(user).require(Permission.MANAGE_TRAVEL);
        return ResponseEntity.ok(travelRepository.setCaption(id, body.getCaption()));
    }

    @Operation(operationId = DELETE_TRAVEL_PHOTO)
    @PostMapping("/photos/delete")
    public ResponseEntity<Void> deleteTravelPhoto(
            @CurrentUser User user,
            @RequestParam("id") Long id
    ) {
        Authorization.with(user).require(Permission.MANAGE_TRAVEL);
        travelRepository.deletePhoto(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * A photo never changes (a new upload gets a new id), so browsers may cache it for a year.
     * Loaded directly via <img src>, not through the API client.
     */
    @Operation(operationId = GET_TRAVEL_PHOTO)
    @GetMapping("/photos/{id}")
    public ResponseEntity<byte[]> getTravelPhoto(@PathVariable Long id) {
        TravelPhotoFile file = travelRepository.getPhotoFile(id);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                .body(file.getData());
    }
}
