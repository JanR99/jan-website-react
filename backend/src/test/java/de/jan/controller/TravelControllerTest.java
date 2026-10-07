package de.jan.controller;

import de.jan.controller.requests.TravelFolderRequest;
import de.jan.role.Permission;
import de.jan.testsupport.ControllerTest;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.repository.TravelRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TravelControllerTest extends ControllerTest {

    private static final String MISSING_PERMISSION = "Missing permission MANAGE_TRAVEL";

    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 1, 2, 3};
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3};

    @Autowired
    private TravelRepository travelRepository;

    @Nested
    class ListTravelFolders {

        @Test
        void returnsAnEmptyListWithoutLogin() throws Exception {
            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void returnsAllFoldersSortedByNameWithTheirPhotos() throws Exception {
            inDatastore(() -> travelRepository.createFolder(request("Prag", "Tschechien", 50.0755, 14.4378)));
            TravelFolderDTO andorra = storedFolder("Andorra", "");
            Long first = storedPhoto(andorra.getId());
            Long second = storedPhoto(andorra.getId());

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", contains("Andorra", "Prag")))
                    .andExpect(jsonPath("$[0].id").value(andorra.getId()))
                    .andExpect(jsonPath("$[0].country").value(""))
                    // in the order they were added; the first one is the cover
                    .andExpect(jsonPath("$[0].photoIds", hasSize(2)))
                    .andExpect(jsonPath("$[0].photoIds[0]").value(first))
                    .andExpect(jsonPath("$[0].photoIds[1]").value(second))
                    .andExpect(jsonPath("$[0].coverPhotoId").value(first))
                    // no place on the map
                    .andExpect(jsonPath("$[0].latitude", nullValue()))
                    .andExpect(jsonPath("$[0].longitude", nullValue()))
                    .andExpect(jsonPath("$[1].country").value("Tschechien"))
                    .andExpect(jsonPath("$[1].latitude").value(50.0755))
                    .andExpect(jsonPath("$[1].longitude").value(14.4378))
                    .andExpect(jsonPath("$[1].photoIds", hasSize(0)))
                    .andExpect(jsonPath("$[1].coverPhotoId", nullValue()));
        }
    }

    @Nested
    class CreateTravelFolder {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "Portugal"))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndStoresNothing() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "Portugal"))))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void withPermission_returnsTheStoredFolder() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("  Porto   2024 ", " Portugal "))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").isNumber())
                    // name and country are cleaned up
                    .andExpect(jsonPath("$.name").value("Porto 2024"))
                    .andExpect(jsonPath("$.country").value("Portugal"))
                    .andExpect(jsonPath("$.latitude", nullValue()))
                    .andExpect(jsonPath("$.longitude", nullValue()))
                    .andExpect(jsonPath("$.photoIds", hasSize(0)))
                    .andExpect(jsonPath("$.coverPhotoId", nullValue()));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[*].name", contains("Porto 2024")));
        }

        @Test
        void withPosition_storesThePlaceOnTheMap() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "Portugal", 41.1496, -8.611))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.latitude").value(41.1496))
                    .andExpect(jsonPath("$.longitude").value(-8.611));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].latitude").value(41.1496))
                    .andExpect(jsonPath("$[0].longitude").value(-8.611));
        }

        @Test
        void withPositionAtTheLimits_isAllowed() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Antarktis", "", -90.0, 180.0))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.latitude").value(-90.0))
                    .andExpect(jsonPath("$.longitude").value(180.0));
        }

        @Test
        void withOnlyLatitude_returns400AndStoresNothing() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "", 41.1496, null))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Latitude and longitude must be given together"));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void withOnlyLongitude_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "", null, -8.611))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Latitude and longitude must be given together"));
        }

        @Test
        void withLatitudeOutOfRange_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "", 90.5, -8.611))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Latitude must be between -90 and 90"));
        }

        @Test
        void withLongitudeOutOfRange_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "", 41.1496, -180.5))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Longitude must be between -180 and 180"));
        }

        @Test
        void withoutCountry_storesAnEmptyCountry() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Roadtrip", null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.country").value(""));
        }

        @Test
        void withEmptyName_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request(" ", "Portugal"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Name must not be empty"));
        }

        @Test
        void withTooLongName_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("x".repeat(81), ""))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Name must be at most 80 characters long"));
        }

        @Test
        void withNameThatExists_returns400() throws Exception {
            storedFolder("Porto", "Portugal");

            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("porto", ""))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A folder with this name already exists"));
        }
    }

    @Nested
    class UpdateTravelFolder {

        @Test
        void withoutLogin_returns401() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "Portugal");

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Lissabon", "Portugal"))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndChangesNothing() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "Portugal");

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Lissabon", "Portugal"))))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[*].name", contains("Porto")));
        }

        @Test
        void withPermission_changesNameAndCountryAndKeepsThePhotos() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "Portugal");
            Long photo = storedPhoto(folder.getId());

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Lissabon", ""))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(folder.getId()))
                    .andExpect(jsonPath("$.name").value("Lissabon"))
                    .andExpect(jsonPath("$.country").value(""))
                    .andExpect(jsonPath("$.photoIds", hasSize(1)))
                    .andExpect(jsonPath("$.photoIds[0]").value(photo));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[*].name", contains("Lissabon")));
        }

        @Test
        void withPosition_setsThePlaceOnTheMap() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "Portugal");

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "Portugal", 41.1496, -8.611))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.latitude").value(41.1496))
                    .andExpect(jsonPath("$.longitude").value(-8.611));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].latitude").value(41.1496))
                    .andExpect(jsonPath("$[0].longitude").value(-8.611));
        }

        @Test
        void withoutPosition_takesTheFolderOffTheMap() throws Exception {
            TravelFolderDTO folder = inDatastore(() -> travelRepository.createFolder(request("Porto", "Portugal", 41.1496, -8.611)));

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "Portugal"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.latitude", nullValue()))
                    .andExpect(jsonPath("$.longitude", nullValue()));
        }

        @Test
        void withPositionOutOfRange_returns400AndKeepsThePosition() throws Exception {
            TravelFolderDTO folder = inDatastore(() -> travelRepository.createFolder(request("Porto", "Portugal", 41.1496, -8.611)));

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Lissabon", "Portugal", -91.0, -8.611))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Latitude must be between -90 and 90"));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].name").value("Porto"))
                    .andExpect(jsonPath("$[0].latitude").value(41.1496));
        }

        @Test
        void withItsOwnName_isAllowed() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "Portugal"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.country").value("Portugal"));
        }

        @Test
        void withNameOfAnotherFolder_returns400() throws Exception {
            storedFolder("Prag", "");
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Prag", ""))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A folder with this name already exists"));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/travel/folders/update").param("id", "999")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", ""))))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Folder 999 not found"));
        }
    }

    @Nested
    class SetTravelFolderCover {

        @Test
        void withoutLogin_returns401() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long photo = storedPhoto(folder.getId());

            mockMvc.perform(post("/api/travel/folders/setCover")
                            .param("id", folder.getId().toString()).param("photoId", photo.toString()))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long photo = storedPhoto(folder.getId());

            mockMvc.perform(post("/api/travel/folders/setCover")
                            .param("id", folder.getId().toString()).param("photoId", photo.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));
        }

        @Test
        void withPermission_makesThePhotoTheCover() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long first = storedPhoto(folder.getId());
            Long second = storedPhoto(folder.getId());

            mockMvc.perform(post("/api/travel/folders/setCover")
                            .param("id", folder.getId().toString()).param("photoId", second.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.coverPhotoId").value(second))
                    .andExpect(jsonPath("$.photoIds", hasSize(2)))
                    .andExpect(jsonPath("$.photoIds[0]").value(first))
                    .andExpect(jsonPath("$.photoIds[1]").value(second));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].coverPhotoId").value(second));
        }

        @Test
        void withoutPhotoId_goesBackToTheFirstPhoto() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long first = storedPhoto(folder.getId());
            Long second = storedPhoto(folder.getId());
            inDatastore(() -> travelRepository.setCover(folder.getId(), second));

            mockMvc.perform(post("/api/travel/folders/setCover").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.coverPhotoId").value(first));
        }

        @Test
        void withPhotoOfAnotherFolder_returns400() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long foreign = storedPhoto(storedFolder("Prag", "").getId());

            mockMvc.perform(post("/api/travel/folders/setCover")
                            .param("id", folder.getId().toString()).param("photoId", foreign.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The photo does not belong to this folder"));
        }

        @Test
        void withUnknownFolder_returns404() throws Exception {
            mockMvc.perform(post("/api/travel/folders/setCover").param("id", "999").param("photoId", "1")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Folder 999 not found"));
        }
    }

    @Nested
    class DeleteTravelFolder {

        @Test
        void withoutLogin_returns401() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(post("/api/travel/folders/delete").param("id", folder.getId().toString()))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndKeepsTheFolder() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(post("/api/travel/folders/delete").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        void withPermission_deletesTheFolderAndItsPhotos() throws Exception {
            TravelFolderDTO porto = storedFolder("Porto", "");
            Long deleted = storedPhoto(porto.getId());
            Long kept = storedPhoto(storedFolder("Prag", "").getId());

            mockMvc.perform(post("/api/travel/folders/delete").param("id", porto.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[*].name", contains("Prag")));
            mockMvc.perform(get("/api/travel/photos/" + deleted)).andExpect(status().isNotFound());
            mockMvc.perform(get("/api/travel/photos/" + kept)).andExpect(status().isOk());
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/travel/folders/delete").param("id", "999")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Folder 999 not found"));
        }
    }

    @Nested
    class UploadTravelPhoto {

        @Test
        void withoutLogin_returns401() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(upload(folder.getId(), JPEG, null))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndStoresNothing() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(upload(folder.getId(), JPEG, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].photoIds", hasSize(0)));
        }

        @Test
        void withPermission_returnsTheFolderWithTheNewPhotoAtTheEnd() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long first = storedPhoto(folder.getId());

            mockMvc.perform(upload(folder.getId(), JPEG, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(folder.getId()))
                    .andExpect(jsonPath("$.photoIds", hasSize(2)))
                    .andExpect(jsonPath("$.photoIds[0]").value(first))
                    .andExpect(jsonPath("$.coverPhotoId").value(first));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].photoIds", hasSize(2)));
        }

        @Test
        void withFileThatIsNoImage_returns400() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(upload(folder.getId(), "just some text".getBytes(), bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Only JPEG, PNG and WebP images are allowed"));
        }

        @Test
        void withEmptyFile_returns400() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(upload(folder.getId(), new byte[0], bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The image is empty"));
        }

        @Test
        void withTooLargeImage_returns400() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(upload(folder.getId(), jpegOfSize(TravelRepository.MAX_PHOTO_BYTES + 1), bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The image must be at most 500 KB"));
        }

        @Test
        void withTooLargeImage_storesNothing() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(upload(folder.getId(), jpegOfSize(TravelRepository.MAX_PHOTO_BYTES + 1), bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isBadRequest());

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].photoIds", hasSize(0)));
        }

        @Test
        void withoutFile_returns400() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(multipart("/api/travel/photos/upload")
                            .param("folderId", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void withUnknownFolder_returns404() throws Exception {
            mockMvc.perform(upload(999L, JPEG, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Folder 999 not found"));
        }
    }

    @Nested
    class DeleteTravelPhoto {

        @Test
        void withoutLogin_returns401() throws Exception {
            Long photo = storedPhoto(storedFolder("Porto", "").getId());

            mockMvc.perform(post("/api/travel/photos/delete").param("id", photo.toString()))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndKeepsThePhoto() throws Exception {
            Long photo = storedPhoto(storedFolder("Porto", "").getId());

            mockMvc.perform(post("/api/travel/photos/delete").param("id", photo.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/travel/photos/" + photo)).andExpect(status().isOk());
        }

        @Test
        void withPermission_removesThePhotoFromTheFolder() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long first = storedPhoto(folder.getId());
            Long second = storedPhoto(folder.getId());

            mockMvc.perform(post("/api/travel/photos/delete").param("id", first.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].photoIds", hasSize(1)))
                    .andExpect(jsonPath("$[0].photoIds[0]").value(second))
                    .andExpect(jsonPath("$[0].coverPhotoId").value(second));
            mockMvc.perform(get("/api/travel/photos/" + first)).andExpect(status().isNotFound());
        }

        @Test
        void ofTheChosenCover_makesTheFirstPhotoTheCoverAgain() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long first = storedPhoto(folder.getId());
            Long second = storedPhoto(folder.getId());
            inDatastore(() -> travelRepository.setCover(folder.getId(), second));

            mockMvc.perform(post("/api/travel/photos/delete").param("id", second.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].coverPhotoId").value(first));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/travel/photos/delete").param("id", "999")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Photo 999 not found"));
        }
    }

    @Nested
    class GetTravelPhoto {

        @Test
        void returnsThePhotoWithoutLogin() throws Exception {
            Long photo = storedPhoto(storedFolder("Porto", "").getId());

            mockMvc.perform(get("/api/travel/photos/" + photo))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.IMAGE_JPEG))
                    .andExpect(content().bytes(JPEG));
        }

        @Test
        void returnsTheContentTypeOfThePhoto() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long photo = lastPhoto(inDatastore(() -> travelRepository.addPhoto(folder.getId(), PNG)));

            mockMvc.perform(get("/api/travel/photos/" + photo))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.IMAGE_PNG))
                    .andExpect(content().bytes(PNG));
        }

        @Test
        void letsTheBrowserCacheThePhotoForAYear() throws Exception {
            Long photo = storedPhoto(storedFolder("Porto", "").getId());

            mockMvc.perform(get("/api/travel/photos/" + photo))
                    .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("max-age=31536000")))
                    .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("public")))
                    .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("immutable")));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(get("/api/travel/photos/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string(""));
        }

        @Test
        void withIdThatIsNoNumber_returns400() throws Exception {
            mockMvc.perform(get("/api/travel/photos/abc"))
                    .andExpect(status().isBadRequest());
        }
    }

    /** A folder without a place on the map. */
    private static TravelFolderRequest request(String name, String country) {
        return request(name, country, null, null);
    }

    private static TravelFolderRequest request(String name, String country, Double latitude, Double longitude) {
        TravelFolderRequest request = new TravelFolderRequest();
        request.setName(name);
        request.setCountry(country);
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        return request;
    }

    private TravelFolderDTO storedFolder(String name, String country) {
        return inDatastore(() -> travelRepository.createFolder(request(name, country)));
    }

    /** Adds a photo and returns its id. */
    private Long storedPhoto(Long folderId) {
        return lastPhoto(inDatastore(() -> travelRepository.addPhoto(folderId, JPEG)));
    }

    private static Long lastPhoto(TravelFolderDTO folder) {
        return folder.getPhotoIds().get(folder.getPhotoIds().size() - 1);
    }

    /** @param authorization value of the Authorization header, null to send the request without login */
    private static RequestBuilder upload(Long folderId, byte[] file, String authorization) {
        MockMultipartHttpServletRequestBuilder request = multipart("/api/travel/photos/upload")
                .file(new MockMultipartFile("file", "image.jpg", MediaType.IMAGE_JPEG_VALUE, file));
        request.param("folderId", folderId.toString());
        if (authorization != null) {
            request.header(HttpHeaders.AUTHORIZATION, authorization);
        }
        return request;
    }

    private static byte[] jpegOfSize(long size) {
        byte[] data = new byte[(int) size];
        System.arraycopy(JPEG, 0, data, 0, JPEG.length);
        return data;
    }
}
