package de.jan.recipe;

import java.util.List;

public record RecipeDTO(Long id, String title, String image, int defaultPortions, String cuisine, List<RecipeTag> tags,
                        List<String> ingredients, List<String> preparation, List<Long> relatedRecipeIds) {

    public static RecipeDTO from(Recipe recipe) {
        return new RecipeDTO(recipe.getId(), recipe.getTitle(), recipe.getImage(), recipe.getDefaultPortions(),
                recipe.getCuisine(), List.copyOf(recipe.getTags()), List.copyOf(recipe.getIngredients()),
                List.copyOf(recipe.getPreparation()), List.copyOf(recipe.getRelatedRecipeIds()));
    }
}
