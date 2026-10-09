import { Recipe } from "../types/Recipe";
import ImageController from "../controller/ImageController";

export const recipeSlug = (title: string) => title.toLowerCase().replace(/\s+/g, "-");

export const COOKBOOK_BASE = "/cookbook";

export const recipePath = (recipe: Pick<Recipe, "title">) => `${COOKBOOK_BASE}/${recipeSlug(recipe.title)}`;

/** What a link to a recipe hands to the recipe page. */
export interface RecipeLinkState {
    /** shown until the list of recipes is loaded */
    recipe?: Recipe;
    /** the page the link is on, like "/cookbook" */
    from?: string;
}

/** Whether the recipe page was reached by a link in the cookbook, so that one step back leads there again. */
export const openedFromCookbook = (linkState: unknown) =>
    (linkState as RecipeLinkState | null)?.from === COOKBOOK_BASE;

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

