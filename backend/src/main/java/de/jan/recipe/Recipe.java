package de.jan.recipe;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import de.jan.objectify.DatastoreEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Recipe implements DatastoreEntity {

    @Id
    private Long id;

    @Index
    private String title;

    /** File name inside public/Bilder/Essen-normal and Essen-thumbnail (".jpg" is added if there is no extension) */
    private String image;

    private int defaultPortions;

    private String cuisine;

    private List<String> tags = new ArrayList<>();

    /** One entry per line; entries ending with ":" are section headers */
    private List<String> ingredients = new ArrayList<>();

    private List<String> preparation = new ArrayList<>();

    private List<Long> relatedRecipeIds = new ArrayList<>();

    public Recipe() {

    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public int getDefaultPortions() { return defaultPortions; }
    public void setDefaultPortions(int defaultPortions) { this.defaultPortions = defaultPortions; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public List<String> getTags() {
        if (tags == null) tags = new ArrayList<>();
        return tags;
    }
    public void setTags(List<String> tags) { this.tags = tags; }

    public List<String> getIngredients() {
        if (ingredients == null) ingredients = new ArrayList<>();
        return ingredients;
    }
    public void setIngredients(List<String> ingredients) { this.ingredients = ingredients; }

    public List<String> getPreparation() {
        if (preparation == null) preparation = new ArrayList<>();
        return preparation;
    }
    public void setPreparation(List<String> preparation) { this.preparation = preparation; }

    public List<Long> getRelatedRecipeIds() {
        if (relatedRecipeIds == null) relatedRecipeIds = new ArrayList<>();
        return relatedRecipeIds;
    }
    public void setRelatedRecipeIds(List<Long> relatedRecipeIds) { this.relatedRecipeIds = relatedRecipeIds; }
}
