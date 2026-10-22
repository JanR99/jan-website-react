import { Recipe } from "../types/Recipe";
import RecipeController from "../controller/RecipeController";
import { storedApi } from "../controller/APIClient";
import { createListStore } from "./createListStore";

const store = createListStore<Recipe>({
    readStored: () => RecipeController.listRecipes(storedApi),
    loadFresh: () => RecipeController.listRecipes(),
    name: "recipes",
    errorMessage: "Die Rezepte konnten nicht geladen werden.",
});

/** Loads the recipes again, e.g. after an admin changed one. */
export function reloadRecipes(): Promise<void> {
    return store.reload();
}

export function useRecipes() {
    const { items, loading, error } = store.useList();
    return { recipes: items, loading, error };
}
