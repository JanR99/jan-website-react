package de.jan.controller;

import de.jan.controller.requests.FavoriteRequest;
import de.jan.recipe.favorites.FavoritesRepository;
import de.jan.security.AuthUtils;
import de.jan.security.Authorization;
import de.jan.user.User;
import de.jan.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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

    private final UserRepository userRepository;
    private final FavoritesRepository favoritesRepository;

    private static final String GET_FAVORITES = "getFavorites";
    private static final String ADD_FAVORITE = "addFavorite";
    private static final String REMOVE_FAVORITE = "removeFavorite";

    public FavoritesController(UserRepository userRepository, FavoritesRepository favoritesRepository) {
        this.userRepository = userRepository;
        this.favoritesRepository = favoritesRepository;
    }

    @Operation(operationId = GET_FAVORITES)
    @GetMapping("/list")
    public ResponseEntity<List<String>> getFavorites(HttpServletRequest request) {
        return ResponseEntity.ok(currentUser(request).getFavorites());
    }

    @Operation(operationId = ADD_FAVORITE)
    @PostMapping("/add")
    public ResponseEntity<List<String>> addFavorite(
            HttpServletRequest request,
            @RequestBody FavoriteRequest body
    ) {
        return ResponseEntity.ok(favoritesRepository.addFavorite(currentUser(request), body.getTitle()));
    }

    @Operation(operationId = REMOVE_FAVORITE)
    @PostMapping("/remove")
    public ResponseEntity<List<String>> removeFavorite(
            HttpServletRequest request,
            @RequestBody FavoriteRequest body
    ) {
        return ResponseEntity.ok(favoritesRepository.removeFavorite(currentUser(request), body.getTitle()));
    }

    private User currentUser(HttpServletRequest request) {
        User caller = userRepository.getByEmail(AuthUtils.getCurrentEmail(request));
        Authorization.isLoggedIn(caller);
        return caller;
    }
}
