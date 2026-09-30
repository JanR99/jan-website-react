package de.jan.recipe;

import de.jan.objectify.BaseDAO;

public class RecipeDAO extends BaseDAO<Recipe, Long> {

    public RecipeDAO() {
        super(Recipe.class);
    }
}
