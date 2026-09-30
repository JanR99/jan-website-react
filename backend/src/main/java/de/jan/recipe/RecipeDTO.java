package de.jan.recipe;

import java.util.List;

public class RecipeDTO {

    private Long id;
    private String title;
    private String image;
    private int defaultPortions;
    private String cuisine;
    private List<RecipeTag> tags;
    private List<String> ingredients;
    private List<String> preparation;
    private List<Long> relatedRecipeIds;

    public static RecipeDTO from(Recipe recipe) {
        RecipeDTO dto = new RecipeDTO();
        dto.id = recipe.getId();
        dto.title = recipe.getTitle();
        dto.image = recipe.getImage();
        dto.defaultPortions = recipe.getDefaultPortions();
        dto.cuisine = recipe.getCuisine();
        dto.tags = List.copyOf(recipe.getTags());
        dto.ingredients = List.copyOf(recipe.getIngredients());
        dto.preparation = List.copyOf(recipe.getPreparation());
        dto.relatedRecipeIds = List.copyOf(recipe.getRelatedRecipeIds());
        return dto;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getImage() { return image; }
    public int getDefaultPortions() { return defaultPortions; }
    public String getCuisine() { return cuisine; }
    public List<RecipeTag> getTags() { return tags; }
    public List<String> getIngredients() { return ingredients; }
    public List<String> getPreparation() { return preparation; }
    public List<Long> getRelatedRecipeIds() { return relatedRecipeIds; }
}
