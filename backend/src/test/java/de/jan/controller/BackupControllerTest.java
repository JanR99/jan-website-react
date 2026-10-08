package de.jan.controller;

import com.fasterxml.jackson.databind.JsonNode;
import de.jan.backup.BackupRepository.FolderBackup;
import de.jan.backup.BackupRepository.RecipeBackup;
import de.jan.backup.BackupRepository.StopBackup;
import de.jan.backup.RestoreRepository;
import de.jan.controller.requests.RecipeRequest;
import de.jan.controller.requests.TravelFolderRequest;
import de.jan.controller.requests.TravelStopRequest;
import de.jan.image.ImageRepository;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeTag;
import de.jan.recipe.favorites.FavoritesRepository;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.role.Permission;
import de.jan.testsupport.ControllerTest;
import de.jan.travel.TravelFolderDTO;
import de.jan.travel.TravelPhotoDTO;
import de.jan.travel.repository.TravelRepository;
import de.jan.user.User;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import static org.hamcrest.Matchers.matchesPattern;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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

    @Autowired
    private FavoritesRepository favoritesRepository;

    @Autowired
    private RestoreRepository restoreRepository;

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

    @Nested
    class RestoreBackup {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(post("/api/backup/restore").content(zip(emptyBackup())))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndChangesNothing() throws Exception {
            storedRecipe("Pesto", JPEG, List.of());
            String everythingElse = bearerWith(Permission.MANAGE_RECIPES, Permission.MANAGE_TRAVEL,
                    Permission.MANAGE_USERS, Permission.MANAGE_FEEDBACK);

            mockMvc.perform(restore(everythingElse, zip(emptyBackup())))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string("Missing permission EXPORT_DATA"));

            assertEquals(List.of("Pesto"), recipeTitles());
        }

        @Test
        void onCloudRun_returns403AndChangesNothing() throws Exception {
            storedRecipe("Pesto", JPEG, List.of());
            ReflectionTestUtils.setField(restoreRepository, "onCloudRun", true);
            try {
                mockMvc.perform(restore(bearer(adminUser()), zip(emptyBackup())))
                        .andExpect(status().isForbidden())
                        .andExpect(content().string("A backup can only be restored on a local machine"));
            } finally {
                ReflectionTestUtils.setField(restoreRepository, "onCloudRun", false);
            }

            assertEquals(List.of("Pesto"), recipeTitles());
        }

        @Test
        void withAFileThatIsNoZip_returns400AndChangesNothing() throws Exception {
            storedRecipe("Pesto", JPEG, List.of());

            mockMvc.perform(restore(bearerWith(Permission.EXPORT_DATA), "no zip".getBytes(StandardCharsets.UTF_8)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The file is not a ZIP file"));

            assertEquals(List.of("Pesto"), recipeTitles());
        }

        @Test
        void withAZipThatIsNoBackup_returns400AndChangesNothing() throws Exception {
            storedRecipe("Pesto", JPEG, List.of());
            Map<String, byte[]> files = emptyBackup();
            files.remove(FOLDERS_FILE);

            mockMvc.perform(restore(bearerWith(Permission.EXPORT_DATA), zip(files)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The file is not a backup of this website: travel/folders.json is missing"));

            assertEquals(List.of("Pesto"), recipeTitles());
        }

        @Test
        void withAListThatCannotBeRead_returns400AndChangesNothing() throws Exception {
            storedRecipe("Pesto", JPEG, List.of());
            Map<String, byte[]> files = emptyBackup();
            files.put(RECIPES_FILE, "{}".getBytes(StandardCharsets.UTF_8));

            mockMvc.perform(restore(bearerWith(Permission.EXPORT_DATA), zip(files)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The file is not a backup of this website: recipes/recipes.json cannot be read"));

            assertEquals(List.of("Pesto"), recipeTitles());
        }

        @Test
        void withAnEmptyBackup_deletesEverything() throws Exception {
            storedRecipe("Pesto", JPEG, List.of());
            storedFolder("Andorra", "", null, null);

            mockMvc.perform(restore(bearerWith(Permission.EXPORT_DATA), zip(emptyBackup())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.recipes").value(0))
                    .andExpect(jsonPath("$.folders").value(0))
                    .andExpect(jsonPath("$.photos").value(0));

            assertEquals(List.of(), recipeTitles());
            assertEquals(List.of(), folderNames());
        }

        @Test
        void replacesAllRecipesAndFoldersByTheOnesOfTheBackup() throws Exception {
            User fan = userWith();
            Recipe old = storedRecipe("Alt", JPEG, List.of());
            inDatastore(() -> favoritesRepository.addFavorite(userRepository.getByEmail(fan.getEmail()), old.getId()));
            TravelFolderDTO oldFolder = storedFolder("Andorra", "", null, null);
            Long oldPhoto = storedPhoto(oldFolder.getId(), JPEG);

            Map<String, byte[]> files = new LinkedHashMap<>();
            files.put("recipes/images/1.jpg", JPEG);
            files.put("recipes/images/2.png", PNG);
            files.put(RECIPES_FILE, objectMapper.writeValueAsBytes(List.of(
                    recipeBackup("Pasta", "2.png", List.of("Pesto")),
                    recipeBackup("Pesto", "1.jpg", List.of()))));
            files.put("travel/images/7.jpg", JPEG);
            files.put("travel/images/8.png", PNG);
            files.put(FOLDERS_FILE, objectMapper.writeValueAsBytes(List.of(
                    new FolderBackup("Tokio", "Japan", 35.6762, 139.6503,
                            List.of(new StopBackup("Tokio", 35.6762, 139.6503), new StopBackup("Kyoto", 35.0116, 135.7681)),
                            "Seoul", "2025-04", "2025-05", "japanisch", "Erster Absatz.\n\nZweiter Absatz.", "8.png",
                            List.of("7.jpg", "8.png"), Map.of("8.png", "Fuji")),
                    new FolderBackup("Seoul", "Korea", null, null, List.of(), null, "2025-03", null, "", "", null,
                            List.of(), Map.of()))));

            mockMvc.perform(restore(bearerWith(Permission.EXPORT_DATA), zip(files)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.recipes").value(2))
                    .andExpect(jsonPath("$.folders").value(2))
                    .andExpect(jsonPath("$.photos").value(2))
                    .andExpect(jsonPath("$.skippedRecipes").isEmpty())
                    .andExpect(jsonPath("$.skippedFolders").isEmpty())
                    .andExpect(jsonPath("$.skippedPhotos").value(0));

            // sorted by title, like the cookbook
            List<Recipe> recipes = inDatastore(() -> recipeRepository.getAll());
            assertEquals(List.of("Pasta", "Pesto"), recipes.stream().map(Recipe::getTitle).toList());
            Recipe pasta = recipes.get(0);
            Recipe pesto = recipes.get(1);
            assertArrayEquals(PNG, recipeImage(pasta));
            assertArrayEquals(JPEG, recipeImage(pesto));
            assertEquals(2, pasta.getDefaultPortions());
            assertEquals("deutsch", pasta.getCuisine());
            assertEquals(List.of(RecipeTag.VEGETARIAN), pasta.getTags());
            assertEquals(List.of("Teig:", "200 g Mehl"), pasta.getIngredients());
            assertEquals(List.of("Alles mischen.", "Backen."), pasta.getPreparation());
            // "Passt dazu" by title in the backup, by the new id in the database
            assertEquals(List.of(pesto.getId()), pasta.getRelatedRecipeIds());
            assertEquals(List.of(), pesto.getRelatedRecipeIds());

            // what was there before is gone, the favorites with it
            assertNull(inDatastore(() -> imageRepository.getById(ImageRepository.idOf(old.getImage()))));
            assertEquals(List.of(), inDatastore(() -> userRepository.getByEmail(fan.getEmail())).getFavoriteRecipeIds());
            assertNull(inDatastore(() -> travelRepository.getPhotoFile(oldPhoto)));

            // the newest trip first, like the travel diary
            List<TravelFolderDTO> folders = inDatastore(() -> travelRepository.getFolders());
            assertEquals(List.of("Tokio", "Seoul"), folders.stream().map(TravelFolderDTO::getName).toList());
            TravelFolderDTO tokio = folders.get(0);
            TravelFolderDTO seoul = folders.get(1);
            assertEquals("Japan", tokio.getCountry());
            assertEquals(2, tokio.getStops().size());
            assertEquals("Kyoto", tokio.getStops().get(1).getName());
            assertEquals(135.7681, tokio.getStops().get(1).getLongitude());
            // the folder the trip came from by name in the backup, by the new id in the database
            assertEquals(seoul.getId(), tokio.getPreviousFolderId());
            assertEquals("2025-04", tokio.getStartMonth());
            assertEquals("2025-05", tokio.getEndMonth());
            assertEquals("japanisch", tokio.getCuisine());
            assertEquals("Erster Absatz.\n\nZweiter Absatz.", tokio.getText());
            // the photos in their order
            assertEquals(2, tokio.getPhotos().size());
            TravelPhotoDTO first = tokio.getPhotos().get(0);
            TravelPhotoDTO second = tokio.getPhotos().get(1);
            assertArrayEquals(JPEG, inDatastore(() -> travelRepository.getPhotoFile(first.getId())).getData());
            assertArrayEquals(PNG, inDatastore(() -> travelRepository.getPhotoFile(second.getId())).getData());
            assertEquals("", first.getCaption());
            assertEquals("Fuji", second.getCaption());
            assertEquals(second.getId(), tokio.getCoverPhotoId());

            assertEquals("Korea", seoul.getCountry());
            assertEquals(0, seoul.getStops().size());
            assertNull(seoul.getPreviousFolderId());
            assertEquals("2025-03", seoul.getStartMonth());
            assertNull(seoul.getEndMonth());
            assertEquals(0, seoul.getPhotos().size());

            // the seed data must not come on top of it on the next start
            boolean seedImported = inDatastore(() -> travelRepository.isSeedImported());
            assertTrue(seedImported);
        }

        @Test
        void restoresWhatExportWrote() throws Exception {
            Recipe pesto = storedRecipe("Pesto", JPEG, List.of());
            storedRecipe("Pasta", PNG, List.of(pesto.getId()));
            storedFolder("Andorra", "", null, null);
            TravelFolderDTO japan = storedFolder("Tokio", "Japan", "2025-04", "2025-05");
            storedPhoto(japan.getId(), JPEG);
            Long second = storedPhoto(japan.getId(), PNG);
            inDatastore(() -> travelRepository.setText(japan.getId(), "Erster Absatz.\n\nZweiter Absatz."));
            inDatastore(() -> travelRepository.setCaption(second, "Fuji"));
            inDatastore(() -> travelRepository.setCover(japan.getId(), second));
            String bearer = bearerWith(Permission.EXPORT_DATA);
            byte[] backup = mockMvc.perform(get("/api/backup/export").header(HttpHeaders.AUTHORIZATION, bearer))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsByteArray();

            mockMvc.perform(restore(bearer, backup))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.recipes").value(2))
                    .andExpect(jsonPath("$.folders").value(2))
                    .andExpect(jsonPath("$.photos").value(2));

            assertEquals(withoutIds(unzip(backup)), withoutIds(export()));
        }

        @Test
        void leavesOutWhatCannotBeRestored() throws Exception {
            Map<String, byte[]> files = new LinkedHashMap<>();
            files.put("recipes/images/2.png", PNG);
            // the image of Pesto is missing
            files.put(RECIPES_FILE, objectMapper.writeValueAsBytes(List.of(
                    recipeBackup("Pasta", "2.png", List.of("Pesto")),
                    recipeBackup("Pesto", "1.jpg", List.of()))));
            files.put("travel/images/7.jpg", JPEG);
            // the second photo is missing, and the second folder has the name of the first
            files.put(FOLDERS_FILE, objectMapper.writeValueAsBytes(List.of(
                    new FolderBackup("Tokio", "Japan", null, null, List.of(), null, null, null, "", "", null,
                            List.of("7.jpg", "9.jpg"), Map.of()),
                    new FolderBackup("Tokio", "", null, null, List.of(), null, null, null, "", "", null,
                            List.of(), Map.of()))));

            mockMvc.perform(restore(bearerWith(Permission.EXPORT_DATA), zip(files)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.recipes").value(1))
                    .andExpect(jsonPath("$.skippedRecipes.length()").value(1))
                    .andExpect(jsonPath("$.skippedRecipes[0]").value("Pesto"))
                    .andExpect(jsonPath("$.folders").value(1))
                    .andExpect(jsonPath("$.skippedFolders.length()").value(1))
                    .andExpect(jsonPath("$.skippedFolders[0]").value("Tokio"))
                    .andExpect(jsonPath("$.photos").value(1))
                    .andExpect(jsonPath("$.skippedPhotos").value(1));

            List<Recipe> recipes = inDatastore(() -> recipeRepository.getAll());
            assertEquals(List.of("Pasta"), recipes.stream().map(Recipe::getTitle).toList());
            // "Passt dazu" of a recipe that is not there
            assertEquals(List.of(), recipes.get(0).getRelatedRecipeIds());
            List<TravelFolderDTO> folders = inDatastore(() -> travelRepository.getFolders());
            assertEquals(1, folders.size());
            assertEquals("Japan", folders.get(0).getCountry());
            assertEquals(1, folders.get(0).getPhotos().size());
        }
    }

    /** The files of the backup by their name in the ZIP file. */
    private Map<String, byte[]> export() throws Exception {
        byte[] zip = mockMvc.perform(get("/api/backup/export").header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.EXPORT_DATA)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsByteArray();

        return unzip(zip);
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

    private static MockHttpServletRequestBuilder restore(String bearer, byte[] file) {
        return post("/api/backup/restore")
                .header(HttpHeaders.AUTHORIZATION, bearer)
                .contentType("application/zip")
                .content(file);
    }

    /** A backup without recipes and folders. */
    private static Map<String, byte[]> emptyBackup() {
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put(RECIPES_FILE, "[]".getBytes(StandardCharsets.UTF_8));
        files.put(FOLDERS_FILE, "[]".getBytes(StandardCharsets.UTF_8));
        return files;
    }

    /** A recipe of a backup like the ones storedRecipe creates. */
    private static RecipeBackup recipeBackup(String title, String image, List<String> relatedRecipes) {
        return new RecipeBackup(title, image, 2, "deutsch", List.of(RecipeTag.VEGETARIAN),
                List.of("Teig:", "200 g Mehl"), List.of("Alles mischen.", "Backen."), relatedRecipes);
    }

    private static byte[] zip(Map<String, byte[]> files) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ZipOutputStream out = new ZipOutputStream(bytes, StandardCharsets.UTF_8)) {
            for (Map.Entry<String, byte[]> file : files.entrySet()) {
                out.putNextEntry(new ZipEntry(file.getKey()));
                out.write(file.getValue());
                out.closeEntry();
            }
        }
        return bytes.toByteArray();
    }

    private static Map<String, byte[]> unzip(byte[] zip) throws Exception {
        Map<String, byte[]> files = new LinkedHashMap<>();
        try (ZipInputStream in = new ZipInputStream(new ByteArrayInputStream(zip), StandardCharsets.UTF_8)) {
            for (ZipEntry entry = in.getNextEntry(); entry != null; entry = in.getNextEntry()) {
                files.put(entry.getName(), in.readAllBytes());
            }
        }
        return files;
    }

    /**
     * The files of a backup with every image named by its place in the lists instead of by its id,
     * which is a new one after restoring. Two backups with the same content are equal that way.
     */
    private Map<String, Object> withoutIds(Map<String, byte[]> files) throws Exception {
        Map<String, Object> result = new LinkedHashMap<>();
        String recipes = new String(files.get(RECIPES_FILE), StandardCharsets.UTF_8);
        int number = 0;
        for (JsonNode recipe : objectMapper.readTree(recipes)) {
            String image = recipe.get("image").asText();
            String name = "recipe-image-" + number++;
            recipes = recipes.replace('"' + image + '"', '"' + name + '"');
            result.put(name, HexFormat.of().formatHex(files.get("recipes/images/" + image)));
        }
        String folders = new String(files.get(FOLDERS_FILE), StandardCharsets.UTF_8);
        number = 0;
        for (JsonNode folder : objectMapper.readTree(folders)) {
            for (String photo : texts(folder.get("photos"))) {
                String name = "travel-photo-" + number++;
                folders = folders.replace('"' + photo + '"', '"' + name + '"');
                result.put(name, HexFormat.of().formatHex(files.get("travel/images/" + photo)));
            }
        }
        result.put(RECIPES_FILE, objectMapper.readTree(recipes));
        result.put(FOLDERS_FILE, objectMapper.readTree(folders));
        return result;
    }

    private List<String> recipeTitles() {
        return inDatastore(() -> recipeRepository.getAll()).stream().map(Recipe::getTitle).toList();
    }

    private List<String> folderNames() {
        return inDatastore(() -> travelRepository.getFolders()).stream().map(TravelFolderDTO::getName).toList();
    }

    private byte[] recipeImage(Recipe recipe) {
        return inDatastore(() -> imageRepository.getById(ImageRepository.idOf(recipe.getImage()))).getData();
    }
}
