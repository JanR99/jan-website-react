package de.jan.controller;

import de.jan.controller.requests.RecipeRequest;
import de.jan.recipe.RecipeDTO;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.security.Authorization;
import de.jan.security.CurrentUser;
import de.jan.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Recipes of the cookbook. Reading is public, changing requires an admin.
 */
@Tag(name = "recipes")
@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeRepository recipeRepository;

    private static final String LIST_RECIPES = "listRecipes";
    private static final String CREATE_RECIPE = "createRecipe";
    private static final String UPDATE_RECIPE = "updateRecipe";
    private static final String DELETE_RECIPE = "deleteRecipe";

    public RecipeController(RecipeRepository recipeRepository) {
        this.recipeRepository = recipeRepository;
    }

    @Operation(operationId = LIST_RECIPES)
    @GetMapping("/list")
    public ResponseEntity<List<RecipeDTO>> listRecipes() {
        return ResponseEntity.ok(recipeRepository.getAll().stream().map(RecipeDTO::from).toList());
    }

    @Operation(operationId = CREATE_RECIPE)
    @PostMapping("/create")
    public ResponseEntity<RecipeDTO> createRecipe(
            @CurrentUser User user,
            @RequestBody RecipeRequest body
    ) {
        Authorization.with(user).isAdmin();
        return ResponseEntity.ok(RecipeDTO.from(recipeRepository.create(body)));
    }

    @Operation(operationId = UPDATE_RECIPE)
    @PostMapping("/update")
    public ResponseEntity<RecipeDTO> updateRecipe(
            @CurrentUser User user,
            @RequestParam("id") Long id,
            @RequestBody RecipeRequest body
    ) {
        Authorization.with(user).isAdmin();
        return ResponseEntity.ok(RecipeDTO.from(recipeRepository.update(id, body)));
    }

    @Operation(operationId = DELETE_RECIPE)
    @PostMapping("/delete")
    public ResponseEntity<Void> deleteRecipe(
            @CurrentUser User user,
            @RequestParam("id") Long id
    ) {
        Authorization.with(user).isAdmin();
        recipeRepository.delete(id);
        return ResponseEntity.noContent().build();
    }
}
