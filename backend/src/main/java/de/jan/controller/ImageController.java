package de.jan.controller;

import de.jan.controller.response.ImageUploadResponse;
import de.jan.image.ImageRepository;
import de.jan.image.RecipeImage;
import de.jan.security.Authorization;
import de.jan.security.CurrentUser;
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

/**
 * Uploaded recipe images. Uploading requires an admin, reading is public.
 */
@Tag(name = "images")
@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageRepository imageRepository;

    private static final String UPLOAD_IMAGE = "uploadImage";
    private static final String GET_IMAGE = "getImage";

    public ImageController(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    /** The browser scales the image down first; the returned value is then saved as the recipe's image. */
    @Operation(operationId = UPLOAD_IMAGE)
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponse> uploadImage(
            @CurrentUser User user,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        Authorization.with(user).isAdmin();
        return ResponseEntity.ok(new ImageUploadResponse(imageRepository.upload(file.getBytes())));
    }

    /**
     * An image never changes (a new upload gets a new id), so browsers may cache it for a year.
     * Loaded directly via <img src>, not through the API client.
     */
    @Operation(operationId = GET_IMAGE)
    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        RecipeImage image = imageRepository.getById(id);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                .body(image.getData());
    }
}
