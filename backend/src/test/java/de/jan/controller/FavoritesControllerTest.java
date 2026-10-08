package de.jan.controller;

import de.jan.controller.requests.RecipeRequest;
import de.jan.image.ImageRepository;
import de.jan.recipe.Recipe;
import de.jan.recipe.favorites.FavoritesRepository;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.testsupport.ControllerTest;
import de.jan.user.User;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FavoritesControllerTest extends ControllerTest {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private FavoritesRepository favoritesRepository;

    @Nested
    class GetFavorites {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/favorites/list"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutFavorites_returnsAnEmptyList() throws Exception {
            mockMvc.perform(get("/api/favorites/list")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith()))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void returnsOnlyTheFavoritesOfTheCaller() throws Exception {
            Recipe apfelkuchen = storedRecipe("Apfelkuchen");
            Recipe birnenkuchen = storedRecipe("Birnenkuchen");
            User user = userWith();
            User other = userWith();
            favorite(user, apfelkuchen);
            favorite(other, birnenkuchen);

            mockMvc.perform(get("/api/favorites/list")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0]").value(apfelkuchen.getId()));
        }
    }

    @Nested
    class AddFavorite {

        @Test
        void withoutLogin_returns401() throws Exception {
            Recipe recipe = storedRecipe("Apfelkuchen");

            mockMvc.perform(post("/api/favorites/add")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body(recipe.getId())))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void returnsTheFavoritesIncludingTheNewOne() throws Exception {
            Recipe apfelkuchen = storedRecipe("Apfelkuchen");
            Recipe birnenkuchen = storedRecipe("Birnenkuchen");
            User user = userWith();
            favorite(user, apfelkuchen);

            mockMvc.perform(post("/api/favorites/add")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body(birnenkuchen.getId())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0]").value(apfelkuchen.getId()))
                    .andExpect(jsonPath("$[1]").value(birnenkuchen.getId()));

            mockMvc.perform(get("/api/favorites/list")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0]").value(apfelkuchen.getId()))
                    .andExpect(jsonPath("$[1]").value(birnenkuchen.getId()));
        }

        @Test
        void withRecipeThatIsAlreadyAFavorite_keepsItOnce() throws Exception {
            Recipe recipe = storedRecipe("Apfelkuchen");
            User user = userWith();
            favorite(user, recipe);

            mockMvc.perform(post("/api/favorites/add")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body(recipe.getId())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0]").value(recipe.getId()));
        }

        @Test
        void withUnknownRecipe_returns404() throws Exception {
            mockMvc.perform(post("/api/favorites/add")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body(999L)))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("Recipe 999 not found"));
        }

        @Test
        void withoutRecipeId_returns400() throws Exception {
            mockMvc.perform(post("/api/favorites/add")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Recipe id must not be empty"));
        }
    }

    @Nested
    class RemoveFavorite {

        @Test
        void withoutLogin_returns401() throws Exception {
            Recipe recipe = storedRecipe("Apfelkuchen");

            mockMvc.perform(post("/api/favorites/remove")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body(recipe.getId())))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void returnsTheFavoritesWithoutTheRemovedOne() throws Exception {
            Recipe apfelkuchen = storedRecipe("Apfelkuchen");
            Recipe birnenkuchen = storedRecipe("Birnenkuchen");
            User user = userWith();
            favorite(user, apfelkuchen);
            favorite(user, birnenkuchen);

            mockMvc.perform(post("/api/favorites/remove")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body(apfelkuchen.getId())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0]").value(birnenkuchen.getId()));

            mockMvc.perform(get("/api/favorites/list")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0]").value(birnenkuchen.getId()));
        }

        @Test
        void withRecipeThatIsNoFavorite_returnsTheUnchangedList() throws Exception {
            Recipe apfelkuchen = storedRecipe("Apfelkuchen");
            Recipe birnenkuchen = storedRecipe("Birnenkuchen");
            User user = userWith();
            favorite(user, apfelkuchen);

            mockMvc.perform(post("/api/favorites/remove")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body(birnenkuchen.getId())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0]").value(apfelkuchen.getId()));
        }

        @Test
        void withoutRecipeId_returns400() throws Exception {
            mockMvc.perform(post("/api/favorites/remove")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Recipe id must not be empty"));
        }
    }

    private String body(Long recipeId) throws Exception {
        return json(Map.of("recipeId", recipeId));
    }

    private void favorite(User user, Recipe recipe) {
        inDatastore(() -> favoritesRepository.addFavorite(userRepository.getByEmail(user.getEmail()), recipe.getId()));
    }

    private Recipe storedRecipe(String title) {
        // the first bytes of a JPEG are enough for the type check
        byte[] jpeg = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0};
        return inDatastore(() -> {
            RecipeRequest request = new RecipeRequest(
                    imageRepository.upload(jpeg), title, 2, "deutsch", List.of(),
                    List.of("200 g Mehl"), List.of("Backen.")
            );
            return recipeRepository.create(request);
        });
    }
}
