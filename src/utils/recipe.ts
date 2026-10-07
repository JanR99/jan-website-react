import { Recipe } from "../types/Recipe";
import ImageController from "../controller/ImageController";

export const recipeSlug = (title: string) => title.toLowerCase().replace(/\s+/g, "-");

export const recipePath = (recipe: Pick<Recipe, "title">) => `/cookbook/${recipeSlug(recipe.title)}`;

export const recipeImage = (recipe: Pick<Recipe, "image">) => ImageController.getImageUrl(recipe.image);

export function randomRecipe(
    recipes: Recipe[],
    excludeId?: number,
    random: () => number = Math.random
): Recipe | undefined {
    const candidates = recipes.length > 1 ? recipes.filter((recipe) => recipe.id !== excludeId) : recipes;
    return candidates[Math.floor(random() * candidates.length)];
}

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const isVegan = (recipe: Recipe) => recipe.tags?.includes("VEGAN") ?? false;
export const isVegetarian = (recipe: Recipe) =>
    isVegan(recipe) || (recipe.tags?.includes("VEGETARIAN") ?? false);

