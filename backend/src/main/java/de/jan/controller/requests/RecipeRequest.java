package de.jan.controller.requests;

import de.jan.recipe.RecipeTag;

import java.util.List;

public record RecipeRequest(String image, String title, Integer defaultPortions, String cuisine, List<RecipeTag> tags,
                            List<String> ingredients, List<String> preparation, List<Long> relatedRecipeIds) {

    /** Without "Passt dazu" recipes. */
    public RecipeRequest(String image, String title, Integer defaultPortions, String cuisine, List<RecipeTag> tags,
                         List<String> ingredients, List<String> preparation) {
        this(image, title, defaultPortions, cuisine, tags, ingredients, preparation, List.of());
    }
}
