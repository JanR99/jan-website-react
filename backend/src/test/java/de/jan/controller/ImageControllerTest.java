package de.jan.controller;

import de.jan.image.ImageRepository;
import de.jan.role.Permission;
import de.jan.testsupport.ControllerTest;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ImageControllerTest extends ControllerTest {

    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 1, 2, 3};
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3};

    @Autowired
    private ImageRepository imageRepository;

    @Nested
    class UploadImage {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(multipart("/api/images/upload").file(file(JPEG)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403() throws Exception {
            mockMvc.perform(multipart("/api/images/upload").file(file(JPEG))
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string("Missing permission MANAGE_RECIPES"));
        }

        @Test
        void withPermission_returnsTheNameOfTheStoredImage() throws Exception {
            mockMvc.perform(multipart("/api/images/upload").file(file(JPEG))
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.image", matchesPattern("uploads/\\d+")));
        }

        @Test
        void withFileThatIsNoImage_returns400() throws Exception {
            mockMvc.perform(multipart("/api/images/upload").file(file("just some text".getBytes()))
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Only JPEG, PNG and WebP images are allowed"));
        }

        @Test
        void withEmptyFile_returns400() throws Exception {
            mockMvc.perform(multipart("/api/images/upload").file(file(new byte[0]))
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The image is empty"));
        }

        @Test
        void withTooLargeImage_returns400() throws Exception {
            byte[] tooLarge = new byte[(int) ImageRepository.MAX_SIZE_BYTES + 1];
            System.arraycopy(JPEG, 0, tooLarge, 0, JPEG.length);

            mockMvc.perform(multipart("/api/images/upload").file(file(tooLarge))
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The image must be at most 900 KB"));
        }

        @Test
        void withoutFile_returns400() throws Exception {
            mockMvc.perform(multipart("/api/images/upload")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class GetImage {

        @Test
        void returnsTheImageWithoutLogin() throws Exception {
            String id = stored(JPEG);

            mockMvc.perform(get("/api/images/" + id))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.IMAGE_JPEG))
                    .andExpect(content().bytes(JPEG));
        }

        @Test
        void returnsTheContentTypeOfTheImage() throws Exception {
            String id = stored(PNG);

            mockMvc.perform(get("/api/images/" + id))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.IMAGE_PNG))
                    .andExpect(content().bytes(PNG));
        }

        @Test
        void letsTheBrowserCacheTheImageForAYear() throws Exception {
            String id = stored(JPEG);

            mockMvc.perform(get("/api/images/" + id))
                    .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("max-age=31536000")))
                    .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("public")))
                    .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("immutable")));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(get("/api/images/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string(""));
        }

        @Test
        void withIdThatIsNoNumber_returns400() throws Exception {
            mockMvc.perform(get("/api/images/abc"))
                    .andExpect(status().isBadRequest());
        }
    }

    private static MockMultipartFile file(byte[] data) {
        return new MockMultipartFile("file", "image.jpg", MediaType.IMAGE_JPEG_VALUE, data);
    }

    /** Stores an image and returns its id, the part after "uploads/". */
    private String stored(byte[] data) {
        String image = inDatastore(() -> imageRepository.upload(data));
        return String.valueOf(ImageRepository.idOf(image));
    }
}
