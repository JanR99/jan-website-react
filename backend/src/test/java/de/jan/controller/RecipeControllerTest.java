package de.jan.controller;

import de.jan.controller.requests.RecipeRequest;
import de.jan.image.ImageRepository;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeTag;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.role.Permission;
import de.jan.testsupport.ControllerTest;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RecipeControllerTest extends ControllerTest {

    private static final String MISSING_PERMISSION = "Missing permission MANAGE_RECIPES";

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Nested
    class ListRecipes {

        @Test
        void returnsAnEmptyListWithoutLogin() throws Exception {
            mockMvc.perform(get("/api/recipes/list"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void returnsAllRecipesSortedByTitle() throws Exception {
            storedRecipe("Zucchinisuppe");
            Recipe apfelkuchen = storedRecipe("Apfelkuchen");

            mockMvc.perform(get("/api/recipes/list"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].title", contains("Apfelkuchen", "Zucchinisuppe")))
                    .andExpect(jsonPath("$[0].id").value(apfelkuchen.getId()))
                    .andExpect(jsonPath("$[0].image").value(apfelkuchen.getImage()))
                    .andExpect(jsonPath("$[0].defaultPortions").value(2))
                    .andExpect(jsonPath("$[0].cuisine").value("deutsch"))
                    .andExpect(jsonPath("$[0].tags", contains("VEGETARIAN")))
                    .andExpect(jsonPath("$[0].ingredients", contains("Teig:", "200 g Mehl")))
                    .andExpect(jsonPath("$[0].preparation", contains("Alles mischen.", "Backen.")))
                    .andExpect(jsonPath("$[0].relatedRecipeIds", hasSize(0)));
        }
    }

    @Nested
    class CreateRecipe {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(post("/api/recipes/create")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Apfelkuchen"))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withInvalidToken_returns401() throws Exception {
            mockMvc.perform(post("/api/recipes/create")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer not-a-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Apfelkuchen"))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndStoresNothing() throws Exception {
            mockMvc.perform(post("/api/recipes/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Apfelkuchen"))))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/recipes/list")).andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void withPermission_returnsTheStoredRecipe() throws Exception {
            RecipeRequest request = request("  Apfelkuchen   mit Zimt ");
            request.setCuisine("Deutsch");

            mockMvc.perform(post("/api/recipes/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").isNumber())
                    // title and cuisine are cleaned up
                    .andExpect(jsonPath("$.title").value("Apfelkuchen mit Zimt"))
                    .andExpect(jsonPath("$.cuisine").value("deutsch"))
                    .andExpect(jsonPath("$.image").value(request.getImage()))
                    .andExpect(jsonPath("$.defaultPortions").value(2))
                    .andExpect(jsonPath("$.tags", contains("VEGETARIAN")))
                    .andExpect(jsonPath("$.ingredients", contains("Teig:", "200 g Mehl")))
                    .andExpect(jsonPath("$.preparation", contains("Alles mischen.", "Backen.")));

            mockMvc.perform(get("/api/recipes/list"))
                    .andExpect(jsonPath("$[*].title", contains("Apfelkuchen mit Zimt")));
        }

        @Test
        void withEmptyTitle_returns400() throws Exception {
            RecipeRequest request = request(" ");

            mockMvc.perform(post("/api/recipes/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Title must not be empty"));
        }

        @Test
        void withTitleThatExists_returns400() throws Exception {
            storedRecipe("Apfelkuchen");

            // same URL form as the existing recipe
            mockMvc.perform(post("/api/recipes/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("apfelkuchen"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A recipe with this title already exists"));
        }

        @Test
        void withImageThatWasNotUploaded_returns400() throws Exception {
            RecipeRequest request = request("Apfelkuchen");
            request.setImage("uploads/123456");

            mockMvc.perform(post("/api/recipes/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("The uploaded image was not found, please upload it again"));
        }

        @Test
        void withoutIngredients_returns400() throws Exception {
            RecipeRequest request = request("Apfelkuchen");
            request.setIngredients(List.of(" "));

            mockMvc.perform(post("/api/recipes/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Ingredients must not be empty"));
        }

        @Test
        void withUnknownTag_returns400() throws Exception {
            String body = json(request("Apfelkuchen")).replace("\"VEGETARIAN\"", "\"LECKER\"");

            mockMvc.perform(post("/api/recipes/create")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class UpdateRecipe {

        @Test
        void withoutLogin_returns401() throws Exception {
            Recipe recipe = storedRecipe("Apfelkuchen");

            mockMvc.perform(post("/api/recipes/update").param("id", recipe.getId().toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Birnenkuchen"))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndChangesNothing() throws Exception {
            Recipe recipe = storedRecipe("Apfelkuchen");

            mockMvc.perform(post("/api/recipes/update").param("id", recipe.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Birnenkuchen"))))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/recipes/list"))
                    .andExpect(jsonPath("$[*].title", contains("Apfelkuchen")));
        }

        @Test
        void withPermission_returnsTheChangedRecipe() throws Exception {
            Recipe recipe = storedRecipe("Apfelkuchen");
            RecipeRequest request = request("Birnenkuchen");
            request.setImage(recipe.getImage());
            request.setDefaultPortions(6);
            request.setTags(List.of(RecipeTag.VEGAN));

            mockMvc.perform(post("/api/recipes/update").param("id", recipe.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(recipe.getId()))
                    .andExpect(jsonPath("$.title").value("Birnenkuchen"))
                    .andExpect(jsonPath("$.defaultPortions").value(6))
                    .andExpect(jsonPath("$.tags", contains("VEGAN")));

            mockMvc.perform(get("/api/recipes/list"))
                    .andExpect(jsonPath("$[*].title", contains("Birnenkuchen")));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/recipes/update").param("id", "999")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Birnenkuchen"))))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Recipe 999 not found"));
        }

        @Test
        void withTitleOfAnotherRecipe_returns400() throws Exception {
            storedRecipe("Apfelkuchen");
            Recipe other = storedRecipe("Birnenkuchen");
            RecipeRequest request = request("Apfelkuchen");
            request.setImage(other.getImage());

            mockMvc.perform(post("/api/recipes/update").param("id", other.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("A recipe with this title already exists"));
        }

        @Test
        void withoutId_returns400() throws Exception {
            mockMvc.perform(post("/api/recipes/update")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request("Birnenkuchen"))))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class DeleteRecipe {

        @Test
        void withoutLogin_returns401() throws Exception {
            Recipe recipe = storedRecipe("Apfelkuchen");

            mockMvc.perform(post("/api/recipes/delete").param("id", recipe.getId().toString()))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndKeepsTheRecipe() throws Exception {
            Recipe recipe = storedRecipe("Apfelkuchen");

            mockMvc.perform(post("/api/recipes/delete").param("id", recipe.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith()))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            mockMvc.perform(get("/api/recipes/list")).andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        void withPermission_returns204AndRemovesTheRecipe() throws Exception {
            Recipe recipe = storedRecipe("Apfelkuchen");

            mockMvc.perform(post("/api/recipes/delete").param("id", recipe.getId().toString())
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            mockMvc.perform(get("/api/recipes/list")).andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void withUnknownId_returns404() throws Exception {
            mockMvc.perform(post("/api/recipes/delete").param("id", "999")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Recipe 999 not found"));
        }
    }

    // ---------- helpers ----------

    /** A valid request; its image is uploaded first, like the editor does. */
    private RecipeRequest request(String title) {
        RecipeRequest request = new RecipeRequest();
        request.setTitle(title);
        request.setImage(uploadedImage());
        request.setDefaultPortions(2);
        request.setCuisine("deutsch");
        request.setTags(List.of(RecipeTag.VEGETARIAN));
        request.setIngredients(List.of("Teig:", "200 g Mehl"));
        request.setPreparation(List.of("Alles mischen.", "Backen."));
        request.setRelatedRecipeIds(List.of());
        return request;
    }

    private String uploadedImage() {
        // the first bytes of a JPEG are enough for the type check
        byte[] jpeg = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0};
        return inDatastore(() -> imageRepository.upload(jpeg));
    }

    private Recipe storedRecipe(String title) {
        RecipeRequest request = request(title);
        return inDatastore(() -> recipeRepository.create(request));
    }
}
