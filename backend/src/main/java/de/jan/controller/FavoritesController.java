package de.jan.controller;

import de.jan.controller.requests.FavoriteRequest;
import de.jan.recipe.favorites.FavoritesRepository;
import de.jan.security.CurrentUser;
import de.jan.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Favorite recipes of the logged-in user. All routes are protected by the JwtAuthFilter,
 * require an existing account and always act on the caller's own favorites.
 */
@Tag(name = "favorites")
@RestController
@RequestMapping("/api/favorites")
public class FavoritesController {

    private final FavoritesRepository favoritesRepository;

    private static final String GET_FAVORITES = "getFavorites";
    private static final String ADD_FAVORITE = "addFavorite";
    private static final String REMOVE_FAVORITE = "removeFavorite";

    public FavoritesController(FavoritesRepository favoritesRepository) {
        this.favoritesRepository = favoritesRepository;
    }

    @Operation(operationId = GET_FAVORITES)
    @GetMapping("/list")
    public ResponseEntity<List<String>> getFavorites(
            @CurrentUser User user)
    {
        return ResponseEntity.ok(user.getFavorites());
    }

    @Operation(operationId = ADD_FAVORITE)
    @PostMapping("/add")
    public ResponseEntity<List<String>> addFavorite(
            @CurrentUser User user,
            @RequestBody FavoriteRequest body
    ) {
        return ResponseEntity.ok(favoritesRepository.addFavorite(user, body.getTitle()));
    }

    @Operation(operationId = REMOVE_FAVORITE)
    @PostMapping("/remove")
    public ResponseEntity<List<String>> removeFavorite(
            @CurrentUser User user,
            @RequestBody FavoriteRequest body
    ) {
        return ResponseEntity.ok(favoritesRepository.removeFavorite(user, body.getTitle()));
    }
}
