package de.jan.recipe;

import de.jan.objectify.BaseDAO;

public class RecipeDAO extends BaseDAO<Recipe> {

    public RecipeDAO() {
        super(Recipe.class);
    }
}
