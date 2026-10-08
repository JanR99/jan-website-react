package de.jan.controller;

import de.jan.controller.requests.TravelFolderRequest;
import de.jan.controller.requests.TravelFolderTextRequest;
import de.jan.controller.requests.TravelPhotoCaptionRequest;
import de.jan.controller.requests.TravelStopRequest;
import de.jan.role.Permission;
import de.jan.testsupport.ControllerTest;
import de.jan.travel.TravelFolder;
import de.jan.travel.TravelFolderDAO;
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

import java.util.ArrayList;
import java.util.List;

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
                    .andExpect(jsonPath("$[0].photos", hasSize(2)))
                    .andExpect(jsonPath("$[0].photos[0].id").value(first))
                    .andExpect(jsonPath("$[0].photos[1].id").value(second))
                    // a new photo has no caption
                    .andExpect(jsonPath("$[0].photos[0].caption").value(""))
                    .andExpect(jsonPath("$[0].coverPhotoId").value(first))
                    // no place on the map
                    .andExpect(jsonPath("$[0].stops", hasSize(0)))
                    .andExpect(jsonPath("$[1].country").value("Tschechien"))
                    .andExpect(jsonPath("$[1].stops[0].latitude").value(50.0755))
                    .andExpect(jsonPath("$[1].stops[0].longitude").value(14.4378))
                    .andExpect(jsonPath("$[1].photos", hasSize(0)))
                    .andExpect(jsonPath("$[1].coverPhotoId", nullValue()));
        }

        @Test
        void returnsTheNewestTripFirstAndTheOnesWithoutDateAfterThemByName() throws Exception {
            storedFolder("Wien", "");
            inDatastore(() -> travelRepository.createFolder(requestWithMonths("Prag", "2023-05", null)));
            storedFolder("Andorra", "");
            inDatastore(() -> travelRepository.createFolder(requestWithMonths("Porto", "2024-09", "2024-10")));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].name", contains("Porto", "Prag", "Andorra", "Wien")))
                    .andExpect(jsonPath("$[0].startMonth").value("2024-09"))
                    .andExpect(jsonPath("$[0].endMonth").value("2024-10"))
                    .andExpect(jsonPath("$[1].startMonth").value("2023-05"))
                    .andExpect(jsonPath("$[1].endMonth", nullValue()))
                    .andExpect(jsonPath("$[2].startMonth", nullValue()))
                    .andExpect(jsonPath("$[2].endMonth", nullValue()))
                    // no text yet
                    .andExpect(jsonPath("$[0].text").value(""));
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
                    .andExpect(jsonPath("$.stops", hasSize(0)))
                    .andExpect(jsonPath("$.photos", hasSize(0)))
                    .andExpect(jsonPath("$.coverPhotoId", nullValue()));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[*].name", contains("Porto 2024")));
        }

        @Test
        void withMonths_storesWhenTheTripWas() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithMonths("Porto", " 2024-09 ", "2024-10"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.startMonth").value("2024-09"))
                    .andExpect(jsonPath("$.endMonth").value("2024-10"))
                    .andExpect(jsonPath("$.text").value(""));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].startMonth").value("2024-09"))
                    .andExpect(jsonPath("$[0].endMonth").value("2024-10"));
        }

        @Test
        void withOnlyStartMonth_storesATripWithinOneMonth() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithMonths("Porto", "2024-09", ""))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.startMonth").value("2024-09"))
                    .andExpect(jsonPath("$.endMonth", nullValue()));
        }

        @Test
        void withTheSameEndMonth_storesNoEndMonth() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithMonths("Porto", "2024-09", "2024-09"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.startMonth").value("2024-09"))
                    .andExpect(jsonPath("$.endMonth", nullValue()));
        }

        @Test
        void withoutMonths_storesNoDate() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithMonths("Porto", null, null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.startMonth", nullValue()))
                    .andExpect(jsonPath("$.endMonth", nullValue()));
        }

        @Test
        void withOnlyEndMonth_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithMonths("Porto", null, "2024-10"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("An end month needs a start month"));
        }

        @Test
        void withEndMonthBeforeStartMonth_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithMonths("Porto", "2024-09", "2023-12"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The end month must not be before the start month"));
        }

        @Test
        void withStartMonthThatIsNoMonth_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithMonths("Porto", "2024-13", null))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Start month must be a year and a month like 2024-05"));
        }

        @Test
        void withEndMonthInAnotherFormat_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithMonths("Porto", "2024-09", "10/2024"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("End month must be a year and a month like 2024-05"));
        }

        @Test
        void withPosition_storesThePlaceOnTheMap() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "Portugal", 41.1496, -8.611))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.stops[0].latitude").value(41.1496))
                    .andExpect(jsonPath("$.stops[0].longitude").value(-8.611));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].stops[0].latitude").value(41.1496))
                    .andExpect(jsonPath("$[0].stops[0].longitude").value(-8.611));
        }

        @Test
        void withPositionAtTheLimits_isAllowed() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Antarktis", "", -90.0, 180.0))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.stops[0].latitude").value(-90.0))
                    .andExpect(jsonPath("$.stops[0].longitude").value(180.0));
        }

        @Test
        void withOnlyLatitude_returns400AndStoresNothing() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "", 41.1496, null))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A stop needs a latitude and a longitude"));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void withOnlyLongitude_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "", null, -8.611))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A stop needs a latitude and a longitude"));
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
        void withCuisine_storesTheCuisineOfTheTrip() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithCuisine("Japan", "  japanisch "))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.cuisine").value("japanisch"));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].cuisine").value("japanisch"));
        }

        @Test
        void withoutCuisine_storesAnEmptyCuisine() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithCuisine("Roadtrip", null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.cuisine").value(""));
        }

        @Test
        void withTooLongCuisine_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithCuisine("Japan", "x".repeat(81)))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Cuisine must be at most 80 characters long"));
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
                    .andExpect(jsonPath("$.photos", hasSize(1)))
                    .andExpect(jsonPath("$.photos[0].id").value(photo));

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
                    .andExpect(jsonPath("$.stops[0].latitude").value(41.1496))
                    .andExpect(jsonPath("$.stops[0].longitude").value(-8.611));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].stops[0].latitude").value(41.1496))
                    .andExpect(jsonPath("$[0].stops[0].longitude").value(-8.611));
        }

        @Test
        void withoutPosition_takesTheFolderOffTheMap() throws Exception {
            TravelFolderDTO folder = inDatastore(() -> travelRepository.createFolder(request("Porto", "Portugal", 41.1496, -8.611)));

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", "Portugal"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.stops", hasSize(0)));
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
                    .andExpect(jsonPath("$[0].stops[0].latitude").value(41.1496));
        }

        @Test
        void withMonths_changesWhenTheTripWas() throws Exception {
            TravelFolderDTO folder = inDatastore(() -> travelRepository.createFolder(requestWithMonths("Porto", "2024-09", "2024-10")));

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithMonths("Porto", "2025-03", null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.startMonth").value("2025-03"))
                    .andExpect(jsonPath("$.endMonth", nullValue()));
        }

        @Test
        void withoutMonths_removesTheDate() throws Exception {
            TravelFolderDTO folder = inDatastore(() -> travelRepository.createFolder(requestWithMonths("Porto", "2024-09", "2024-10")));

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Porto", ""))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.startMonth", nullValue()))
                    .andExpect(jsonPath("$.endMonth", nullValue()));
        }

        @Test
        void withCuisine_changesTheCuisineOfTheTrip() throws Exception {
            TravelFolderDTO folder = inDatastore(() -> travelRepository.createFolder(requestWithCuisine("Japan", "chinesisch")));

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithCuisine("Japan", "japanisch"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.cuisine").value("japanisch"));
        }

        @Test
        void withoutCuisine_removesIt() throws Exception {
            TravelFolderDTO folder = inDatastore(() -> travelRepository.createFolder(requestWithCuisine("Japan", "japanisch")));

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Japan", ""))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.cuisine").value(""));
        }

        @Test
        void withEndMonthBeforeStartMonth_returns400AndKeepsTheDate() throws Exception {
            TravelFolderDTO folder = inDatastore(() -> travelRepository.createFolder(requestWithMonths("Porto", "2024-09", "2024-10")));

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(requestWithMonths("Porto", "2024-09", "2024-08"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The end month must not be before the start month"));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].endMonth").value("2024-10"));
        }

        @Test
        void keepsTheText() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            inDatastore(() -> travelRepository.setText(folder.getId(), "Drei Tage am Douro."));

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Lissabon", "Portugal"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Lissabon"))
                    .andExpect(jsonPath("$.text").value("Drei Tage am Douro."));
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
    class StopsAndRoute {

        @Test
        void withSeveralStops_keepsThemInTheirOrderWithCleanedNames() throws Exception {
            TravelFolderRequest request = withStops(request("Spanien", "Spanien"),
                    new TravelStopRequest("  Sevilla ", 37.3891, -5.9845),
                    new TravelStopRequest("Granada", 37.1773, -3.5986),
                    new TravelStopRequest(null, 40.4168, -3.7038));

            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.stops[*].name", contains("Sevilla", "Granada", "")))
                    .andExpect(jsonPath("$.stops[1].latitude").value(37.1773))
                    .andExpect(jsonPath("$.stops[1].longitude").value(-3.5986))
                    .andExpect(jsonPath("$.previousFolderId", nullValue()));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].stops[*].name", contains("Sevilla", "Granada", "")));
        }

        @Test
        void withMostStops_isAllowed() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(withStops(request("Spanien", ""), stops(TravelRepository.MAX_STOPS)))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.stops", hasSize(TravelRepository.MAX_STOPS)));
        }

        @Test
        void withTooManyStops_returns400AndStoresNothing() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(withStops(request("Spanien", ""), stops(TravelRepository.MAX_STOPS + 1)))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A folder can have at most 30 stops"));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void withTooLongStopName_returns400() throws Exception {
            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(withStops(request("Spanien", ""), new TravelStopRequest("x".repeat(81), 37.0, -5.0)))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Stop name must be at most 80 characters long"));
        }

        @Test
        void withFewerStops_replacesThem() throws Exception {
            TravelFolderDTO folder = inDatastore(() -> travelRepository.createFolder(withStops(request("Spanien", ""), stops(3))));

            mockMvc.perform(post("/api/travel/folders/update").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(withStops(request("Spanien", ""), new TravelStopRequest("Madrid", 40.4168, -3.7038)))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.stops[*].name", contains("Madrid")));
        }

        @Test
        void folderStoredBeforeThereWereStops_showsItsPlaceAsTheOnlyStop() throws Exception {
            TravelFolder legacy = storedLegacyFolder("Prag", 50.0755, 14.4378);

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].stops", hasSize(1)))
                    .andExpect(jsonPath("$[0].stops[0].name").value("Prag"))
                    .andExpect(jsonPath("$[0].stops[0].latitude").value(50.0755))
                    .andExpect(jsonPath("$[0].stops[0].longitude").value(14.4378));

            // saved again with stops, the old place is gone
            mockMvc.perform(post("/api/travel/folders/update").param("id", legacy.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Prag", ""))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.stops", hasSize(0)));
        }

        @Test
        void withPreviousFolder_storesWhereTheTripCameFrom() throws Exception {
            TravelFolderDTO portugal = storedFolder("Portugal", "");
            TravelFolderRequest request = request("Spanien", "");
            request.setPreviousFolderId(portugal.getId());

            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.previousFolderId").value(portugal.getId()));
        }

        @Test
        void withUnknownPreviousFolder_returns400AndStoresNothing() throws Exception {
            TravelFolderRequest request = request("Spanien", "");
            request.setPreviousFolderId(12345L);

            mockMvc.perform(post("/api/travel/folders/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The previous folder does not exist"));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void withItselfAsPreviousFolder_returns400() throws Exception {
            TravelFolderDTO spanien = storedFolder("Spanien", "");
            TravelFolderRequest request = request("Spanien", "");
            request.setPreviousFolderId(spanien.getId());

            mockMvc.perform(post("/api/travel/folders/update").param("id", spanien.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A folder cannot come from itself"));
        }

        @Test
        void withPreviousFolderThatComesFromThisOne_returns400AndKeepsTheRoute() throws Exception {
            TravelFolderDTO portugal = storedFolder("Portugal", "");
            TravelFolderRequest spanienRequest = request("Spanien", "");
            spanienRequest.setPreviousFolderId(portugal.getId());
            TravelFolderDTO spanien = inDatastore(() -> travelRepository.createFolder(spanienRequest));
            TravelFolderRequest frankreichRequest = request("Frankreich", "");
            frankreichRequest.setPreviousFolderId(spanien.getId());
            TravelFolderDTO frankreich = inDatastore(() -> travelRepository.createFolder(frankreichRequest));

            // Portugal would come from Frankreich, which comes from Spanien, which comes from Portugal
            TravelFolderRequest request = request("Portugal", "");
            request.setPreviousFolderId(frankreich.getId());
            mockMvc.perform(post("/api/travel/folders/update").param("id", portugal.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The trip would go in a circle"));
        }

        @Test
        void deletingThePreviousFolder_removesItFromTheNextOne() throws Exception {
            TravelFolderDTO portugal = storedFolder("Portugal", "");
            TravelFolderRequest request = request("Spanien", "");
            request.setPreviousFolderId(portugal.getId());
            inDatastore(() -> travelRepository.createFolder(request));

            mockMvc.perform(post("/api/travel/folders/delete").param("id", portugal.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[*].name", contains("Spanien")))
                    .andExpect(jsonPath("$[0].previousFolderId", nullValue()));
        }
    }

    @Nested
    class SetTravelFolderText {

        @Test
        void withoutLogin_returns401() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");

            mockMvc.perform(post("/api/travel/folders/setText").param("id", folder.getId().toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(textRequest("Drei Tage am Douro."))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndKeepsTheText() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            inDatastore(() -> travelRepository.setText(folder.getId(), "Drei Tage am Douro."));

            mockMvc.perform(post("/api/travel/folders/setText").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(textRequest("Etwas anderes"))))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].text").value("Drei Tage am Douro."));
        }

        @Test
        void withPermission_returnsTheFolderWithTheText() throws Exception {
            TravelFolderDTO folder = inDatastore(() -> travelRepository.createFolder(requestWithMonths("Porto", "2024-09", null)));
            Long photo = storedPhoto(folder.getId());

            mockMvc.perform(post("/api/travel/folders/setText").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(textRequest("Drei Tage am Douro."))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(folder.getId()))
                    .andExpect(jsonPath("$.text").value("Drei Tage am Douro."))
                    // everything else stays
                    .andExpect(jsonPath("$.name").value("Porto"))
                    .andExpect(jsonPath("$.startMonth").value("2024-09"))
                    .andExpect(jsonPath("$.photos[0].id").value(photo));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].text").value("Drei Tage am Douro."));
        }

        @Test
        void keepsParagraphsAndLineBreaksButCleansUpTheRest() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            String text = "  Erster Absatz.  \r\n\r\n\r\n\r\nZweiter Absatz,\t\nzweite Zeile.\n   \nDritter Absatz.\n\n";

            mockMvc.perform(post("/api/travel/folders/setText").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(textRequest(text))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.text").value("Erster Absatz.\n\nZweiter Absatz,\nzweite Zeile.\n\nDritter Absatz."));
        }

        @Test
        void withEmptyText_removesIt() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            inDatastore(() -> travelRepository.setText(folder.getId(), "Drei Tage am Douro."));

            mockMvc.perform(post("/api/travel/folders/setText").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(textRequest(" \n "))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.text").value(""));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].text").value(""));
        }

        @Test
        void withoutText_removesIt() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            inDatastore(() -> travelRepository.setText(folder.getId(), "Drei Tage am Douro."));

            mockMvc.perform(post("/api/travel/folders/setText").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(textRequest(null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.text").value(""));
        }

        @Test
        void withLongestText_isAllowed() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            String text = "x".repeat(TravelRepository.TEXT_MAX_LENGTH);

            mockMvc.perform(post("/api/travel/folders/setText").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(textRequest(text))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.text").value(text));
        }

        @Test
        void withTooLongText_returns400AndKeepsTheText() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            inDatastore(() -> travelRepository.setText(folder.getId(), "Drei Tage am Douro."));

            mockMvc.perform(post("/api/travel/folders/setText").param("id", folder.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(textRequest("x".repeat(TravelRepository.TEXT_MAX_LENGTH + 1)))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Text must be at most 10000 characters long"));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].text").value("Drei Tage am Douro."));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/travel/folders/setText").param("id", "999")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(textRequest("Drei Tage am Douro."))))
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
                    .andExpect(jsonPath("$.photos", hasSize(2)))
                    .andExpect(jsonPath("$.photos[0].id").value(first))
                    .andExpect(jsonPath("$.photos[1].id").value(second));

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

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].photos", hasSize(0)));
        }

        @Test
        void withPermission_returnsTheFolderWithTheNewPhotoAtTheEnd() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long first = storedPhoto(folder.getId());

            mockMvc.perform(upload(folder.getId(), JPEG, bearerWith(Permission.MANAGE_TRAVEL)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(folder.getId()))
                    .andExpect(jsonPath("$.photos", hasSize(2)))
                    .andExpect(jsonPath("$.photos[0].id").value(first))
                    .andExpect(jsonPath("$.coverPhotoId").value(first));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].photos", hasSize(2)));
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

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].photos", hasSize(0)));
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
    class SetTravelPhotoCaption {

        @Test
        void withoutLogin_returns401() throws Exception {
            Long photo = storedPhoto(storedFolder("Porto", "").getId());

            mockMvc.perform(post("/api/travel/photos/setCaption").param("id", photo.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(captionRequest("Blick auf den Douro"))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndKeepsTheCaption() throws Exception {
            Long photo = storedPhoto(storedFolder("Porto", "").getId());
            inDatastore(() -> travelRepository.setCaption(photo, "Blick auf den Douro"));

            mockMvc.perform(post("/api/travel/photos/setCaption").param("id", photo.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(captionRequest("Etwas anderes"))))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].photos[0].caption").value("Blick auf den Douro"));
        }

        @Test
        void withPermission_returnsTheFolderWithTheCaption() throws Exception {
            TravelFolderDTO folder = storedFolder("Porto", "");
            Long first = storedPhoto(folder.getId());
            Long second = storedPhoto(folder.getId());

            mockMvc.perform(post("/api/travel/photos/setCaption").param("id", second.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(captionRequest("  Blick   auf den Douro "))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(folder.getId()))
                    .andExpect(jsonPath("$.photos", hasSize(2)))
                    .andExpect(jsonPath("$.photos[0].id").value(first))
                    .andExpect(jsonPath("$.photos[0].caption").value(""))
                    .andExpect(jsonPath("$.photos[1].id").value(second))
                    // the caption is cleaned up
                    .andExpect(jsonPath("$.photos[1].caption").value("Blick auf den Douro"));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].photos[1].caption").value("Blick auf den Douro"));
        }

        @Test
        void withEmptyCaption_removesIt() throws Exception {
            Long photo = storedPhoto(storedFolder("Porto", "").getId());
            inDatastore(() -> travelRepository.setCaption(photo, "Blick auf den Douro"));

            mockMvc.perform(post("/api/travel/photos/setCaption").param("id", photo.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(captionRequest("  "))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.photos[0].caption").value(""));

            mockMvc.perform(get("/api/travel/folders/list")).andExpect(jsonPath("$[0].photos[0].caption").value(""));
        }

        @Test
        void withoutCaption_removesIt() throws Exception {
            Long photo = storedPhoto(storedFolder("Porto", "").getId());
            inDatastore(() -> travelRepository.setCaption(photo, "Blick auf den Douro"));

            mockMvc.perform(post("/api/travel/photos/setCaption").param("id", photo.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(captionRequest(null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.photos[0].caption").value(""));
        }

        @Test
        void withLongestCaption_isAllowed() throws Exception {
            Long photo = storedPhoto(storedFolder("Porto", "").getId());
            String caption = "x".repeat(TravelRepository.CAPTION_MAX_LENGTH);

            mockMvc.perform(post("/api/travel/photos/setCaption").param("id", photo.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(captionRequest(caption))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.photos[0].caption").value(caption));
        }

        @Test
        void withTooLongCaption_returns400AndKeepsTheCaption() throws Exception {
            Long photo = storedPhoto(storedFolder("Porto", "").getId());
            inDatastore(() -> travelRepository.setCaption(photo, "Blick auf den Douro"));

            mockMvc.perform(post("/api/travel/photos/setCaption").param("id", photo.toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(captionRequest("x".repeat(TravelRepository.CAPTION_MAX_LENGTH + 1)))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Caption must be at most 200 characters long"));

            mockMvc.perform(get("/api/travel/folders/list"))
                    .andExpect(jsonPath("$[0].photos[0].caption").value("Blick auf den Douro"));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/travel/photos/setCaption").param("id", "999")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_TRAVEL))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(captionRequest("Blick auf den Douro"))))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Photo 999 not found"));
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
                    .andExpect(jsonPath("$[0].photos", hasSize(1)))
                    .andExpect(jsonPath("$[0].photos[0].id").value(second))
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
        if (latitude != null || longitude != null) {
            request.setStops(List.of(new TravelStopRequest(name, latitude, longitude)));
        }
        return request;
    }

    private static TravelFolderRequest withStops(TravelFolderRequest request, TravelStopRequest... stops) {
        request.setStops(List.of(stops));
        return request;
    }

    /** Stops named "Stopp 1", "Stopp 2", … */
    private static TravelStopRequest[] stops(int count) {
        List<TravelStopRequest> stops = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            stops.add(new TravelStopRequest("Stopp " + i, 40.0 + i / 100.0, -3.0));
        }
        return stops.toArray(new TravelStopRequest[0]);
    }

    /** A folder as it was stored before there were stops: with one place of its own. */
    private TravelFolder storedLegacyFolder(String name, double latitude, double longitude) {
        return inDatastore(() -> {
            TravelFolder folder = new TravelFolder();
            folder.setName(name);
            folder.setLegacyPosition(latitude, longitude);
            return new TravelFolderDAO().save(folder);
        });
    }

    /** A folder without a country and a place on the map; the months as year and month like "2024-05". */
    private static TravelFolderRequest requestWithMonths(String name, String startMonth, String endMonth) {
        TravelFolderRequest request = request(name, "");
        request.setStartMonth(startMonth);
        request.setEndMonth(endMonth);
        return request;
    }

    /** A folder without a country and a place on the map; the cuisine like "japanisch". */
    private static TravelFolderRequest requestWithCuisine(String name, String cuisine) {
        TravelFolderRequest request = request(name, "");
        request.setCuisine(cuisine);
        return request;
    }

    private static TravelFolderTextRequest textRequest(String text) {
        TravelFolderTextRequest request = new TravelFolderTextRequest();
        request.setText(text);
        return request;
    }

    private static TravelPhotoCaptionRequest captionRequest(String caption) {
        TravelPhotoCaptionRequest request = new TravelPhotoCaptionRequest();
        request.setCaption(caption);
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
        return folder.getPhotos().getLast().getId();
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
