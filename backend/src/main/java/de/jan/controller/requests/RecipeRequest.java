package de.jan.controller.requests;

import de.jan.recipe.RecipeTag;

import java.util.List;

public class RecipeRequest {

    private String title;
    private String image;
    private Integer defaultPortions;
    private String cuisine;
    private List<RecipeTag> tags;
    private List<String> ingredients;
    private List<String> preparation;
    private List<Long> relatedRecipeIds;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Integer getDefaultPortions() { return defaultPortions; }
    public void setDefaultPortions(Integer defaultPortions) { this.defaultPortions = defaultPortions; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public List<RecipeTag> getTags() { return tags; }
    public void setTags(List<RecipeTag> tags) { this.tags = tags; }

    public List<String> getIngredients() { return ingredients; }
    public void setIngredients(List<String> ingredients) { this.ingredients = ingredients; }

    public List<String> getPreparation() { return preparation; }
    public void setPreparation(List<String> preparation) { this.preparation = preparation; }

    public List<Long> getRelatedRecipeIds() { return relatedRecipeIds; }
    public void setRelatedRecipeIds(List<Long> relatedRecipeIds) { this.relatedRecipeIds = relatedRecipeIds; }
}
