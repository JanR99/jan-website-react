package de.jan.controller;

import de.jan.image.StoredImage;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.time.Duration;

/** The answer for a stored image, loaded directly via <img src> and not through the API client. */
final class ImageResponse {

    private ImageResponse() {

    }

    /**
     * The image with its content type. An image never changes (a new upload gets a new id),
     * so browsers may cache it for a year. 404 if there is no image.
     */
    static ResponseEntity<byte[]> of(StoredImage image) {
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                .body(image.getData());
    }
}
