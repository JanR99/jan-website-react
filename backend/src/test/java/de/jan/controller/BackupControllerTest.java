package de.jan.controller;

import com.fasterxml.jackson.databind.JsonNode;
import de.jan.controller.requests.RecipeRequest;
import de.jan.controller.requests.TravelFolderRequest;
import de.jan.controller.requests.TravelStopRequest;
import de.jan.image.ImageRepository;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeTag;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.role.Permission;
import de.jan.testsupport.ControllerTest;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.repository.TravelRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.hamcrest.Matchers.matchesPattern;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BackupControllerTest extends ControllerTest {

    private static final String RECIPES_FILE = "recipes/recipes.json";
    private static final String FOLDERS_FILE = "travel/folders.json";

    // the first bytes are enough for the type check
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 1, 2, 3};
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3};

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private TravelRepository travelRepository;

    @Nested
    class ExportBackup {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/backup/export"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403() throws Exception {
            String everythingElse = bearerWith(Permission.MANAGE_RECIPES, Permission.MANAGE_TRAVEL, Permission.MANAGE_USERS);

            mockMvc.perform(get("/api/backup/export").header(HttpHeaders.AUTHORIZATION, everythingElse))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string("Missing permission EXPORT_DATA"));
        }

        @Test
        void withPermission_returnsAZipFileToDownload() throws Exception {
            mockMvc.perform(get("/api/backup/export").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.EXPORT_DATA)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith("application/zip"))
                    .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                            matchesPattern("attachment; filename=\"jan-website-backup-\\d{4}-\\d{2}-\\d{2}\\.zip\"")));
        }

        @Test
        void asAdmin_isAllowed() throws Exception {
            mockMvc.perform(get("/api/backup/export").header(HttpHeaders.AUTHORIZATION, bearer(adminUser())))
                    .andExpect(status().isOk());
        }

        @Test
        void withEmptyDatabase_containsTwoEmptyLists() throws Exception {
            Map<String, byte[]> files = export();

            assertEquals(Set.of(RECIPES_FILE, FOLDERS_FILE), files.keySet());
            assertEquals(0, objectMapper.readTree(files.get(RECIPES_FILE)).size());
            assertEquals(0, objectMapper.readTree(files.get(FOLDERS_FILE)).size());
        }

        @Test
        void containsTheRecipesWithTheirImages() throws Exception {
            Recipe pesto = storedRecipe("Pesto", JPEG, List.of());
            Recipe pasta = storedRecipe("Pasta", PNG, List.of(pesto.getId()));
            String pestoImage = ImageRepository.idOf(pesto.getImage()) + ".jpg";
            String pastaImage = ImageRepository.idOf(pasta.getImage()) + ".png";

            Map<String, byte[]> files = export();

            assertEquals(Set.of(RECIPES_FILE, FOLDERS_FILE, "recipes/images/" + pestoImage, "recipes/images/" + pastaImage),
                    files.keySet());
            assertArrayEquals(JPEG, files.get("recipes/images/" + pestoImage));
            assertArrayEquals(PNG, files.get("recipes/images/" + pastaImage));

            // sorted by title, like the cookbook
            JsonNode recipes = objectMapper.readTree(files.get(RECIPES_FILE));
            assertEquals(2, recipes.size());
            JsonNode first = recipes.get(0);
            assertEquals("Pasta", first.get("title").asText());
            assertEquals(pastaImage, first.get("image").asText());
            assertEquals(2, first.get("defaultPortions").asInt());
            assertEquals("deutsch", first.get("cuisine").asText());
            assertEquals(List.of("VEGETARIAN"), texts(first.get("tags")));
            assertEquals(List.of("Teig:", "200 g Mehl"), texts(first.get("ingredients")));
            assertEquals(List.of("Alles mischen.", "Backen."), texts(first.get("preparation")));
            // "Passt dazu" as titles, the way the seed data has it
            assertEquals(List.of("Pesto"), texts(first.get("relatedRecipes")));

            JsonNode second = recipes.get(1);
            assertEquals("Pesto", second.get("title").asText());
            assertEquals(pestoImage, second.get("image").asText());
            assertEquals(List.of(), texts(second.get("relatedRecipes")));
        }

        @Test
        void containsTheTravelFoldersWithTheirPhotos() throws Exception {
            storedFolder("Andorra", "", null, null);
            TravelFolderDTO japan = storedFolder("Tokio", "Japan", "2025-04", "2025-05");
            Long first = storedPhoto(japan.getId(), JPEG);
            Long second = storedPhoto(japan.getId(), PNG);
            inDatastore(() -> travelRepository.setText(japan.getId(), "Erster Absatz.\n\nZweiter Absatz."));
            inDatastore(() -> travelRepository.setCaption(second, "Fuji"));
            inDatastore(() -> travelRepository.setCover(japan.getId(), second));

            Map<String, byte[]> files = export();

            assertEquals(Set.of(RECIPES_FILE, FOLDERS_FILE, "travel/images/" + first + ".jpg", "travel/images/" + second + ".png"),
                    files.keySet());
            assertArrayEquals(JPEG, files.get("travel/images/" + first + ".jpg"));
            assertArrayEquals(PNG, files.get("travel/images/" + second + ".png"));

            // the newest trip first, like the travel diary
            JsonNode folders = objectMapper.readTree(files.get(FOLDERS_FILE));
            assertEquals(2, folders.size());
            JsonNode tokio = folders.get(0);
            assertEquals("Tokio", tokio.get("name").asText());
            assertEquals("Japan", tokio.get("country").asText());
            assertEquals(35.6762, tokio.get("latitude").asDouble());
            assertEquals(139.6503, tokio.get("longitude").asDouble());
            // all stops in their order; latitude and longitude above are the first one, for the seed data
            assertEquals(2, tokio.get("stops").size());
            assertEquals("Kyoto", tokio.get("stops").get(1).get("name").asText());
            assertEquals(135.7681, tokio.get("stops").get(1).get("longitude").asDouble());
            assertTrue(tokio.get("previousFolder").isNull());
            assertEquals("2025-04", tokio.get("startMonth").asText());
            assertEquals("2025-05", tokio.get("endMonth").asText());
            assertEquals("japanisch", tokio.get("cuisine").asText());
            assertEquals("Erster Absatz.\n\nZweiter Absatz.", tokio.get("text").asText());
            assertEquals(second + ".png", tokio.get("cover").asText());
            // in the order they are shown
            assertEquals(List.of(first + ".jpg", second + ".png"), texts(tokio.get("photos")));
            // only the photos that have one
            assertEquals(1, tokio.get("captions").size());
            assertEquals("Fuji", tokio.get("captions").get(second + ".png").asText());

            JsonNode andorra = folders.get(1);
            assertEquals("Andorra", andorra.get("name").asText());
            assertTrue(andorra.get("latitude").isNull());
            assertTrue(andorra.get("startMonth").isNull());
            assertTrue(andorra.get("cover").isNull());
            assertEquals(0, andorra.get("photos").size());
            assertEquals(0, andorra.get("captions").size());
        }
    }

    /** The files of the backup by their name in the ZIP file. */
    private Map<String, byte[]> export() throws Exception {
        byte[] zip = mockMvc.perform(get("/api/backup/export").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.EXPORT_DATA)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsByteArray();

        Map<String, byte[]> files = new LinkedHashMap<>();
        try (ZipInputStream in = new ZipInputStream(new ByteArrayInputStream(zip), StandardCharsets.UTF_8)) {
            for (ZipEntry entry = in.getNextEntry(); entry != null; entry = in.getNextEntry()) {
                files.put(entry.getName(), in.readAllBytes());
            }
        }
        return files;
    }

    private static List<String> texts(JsonNode array) {
        List<String> texts = new ArrayList<>();
        array.forEach(node -> texts.add(node.asText()));
        return texts;
    }

    private Recipe storedRecipe(String title, byte[] image, List<Long> relatedRecipeIds) {
        RecipeRequest request = new RecipeRequest();
        request.setTitle(title);
        request.setImage(inDatastore(() -> imageRepository.upload(image)));
        request.setDefaultPortions(2);
        request.setCuisine("deutsch");
        request.setTags(List.of(RecipeTag.VEGETARIAN));
        request.setIngredients(List.of("Teig:", "200 g Mehl"));
        request.setPreparation(List.of("Alles mischen.", "Backen."));
        request.setRelatedRecipeIds(relatedRecipeIds);
        return inDatastore(() -> recipeRepository.create(request));
    }

    /** A folder with stops in Tokyo and Kyoto and the Japanese cuisine if it has a country, otherwise one with nothing but its name. */
    private TravelFolderDTO storedFolder(String name, String country, String startMonth, String endMonth) {
        TravelFolderRequest request = new TravelFolderRequest();
        request.setName(name);
        request.setCountry(country);
        if (!country.isEmpty()) {
            request.setStops(List.of(new TravelStopRequest("Tokio", 35.6762, 139.6503), new TravelStopRequest("Kyoto", 35.0116, 135.7681)));
            request.setCuisine("japanisch");
        }
        request.setStartMonth(startMonth);
        request.setEndMonth(endMonth);
        return inDatastore(() -> travelRepository.createFolder(request));
    }

    /** Adds a photo and returns its id. */
    private Long storedPhoto(Long folderId, byte[] data) {
        return inDatastore(() -> travelRepository.addPhoto(folderId, data)).getPhotos().getLast().getId();
    }
}
