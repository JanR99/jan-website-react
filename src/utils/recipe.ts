import { Recipe } from "../types/Recipe";
import ImageController from "../controller/ImageController";

/** The title as it stood in a recipe address before those got the id; links from back then still have it. */
export const recipeSlug = (title: string) => title.toLowerCase().replace(/\s+/g, "-");

/** The title as the readable part of a recipe address: letters and digits, everything else becomes a hyphen. */
const addressTitle = (title: string) => title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

/** The last part of a recipe address, like "12-falafel-wrap". */
const addressName = (recipe: Pick<Recipe, "id" | "title">) =>
    [recipe.id, addressTitle(recipe.title)].filter(Boolean).join("-");

export const COOKBOOK_BASE = "/cookbook";

/**
 * Like "/cookbook/12-falafel-wrap". The id is what finds the recipe, so a link still works after
 * the recipe was renamed; the title is only there to be read.
 */
export const recipePath = (recipe: Pick<Recipe, "id" | "title">) => `${COOKBOOK_BASE}/${addressName(recipe)}`;

/**
 * The recipe a recipe address stands for.
 *
 * @param recipes the Recipe list
 * @param name the last part of the address, like "12-falafel-wrap"
 */
export function recipeByAddress<T extends Pick<Recipe, "id" | "title">>(recipes: T[], name: string | undefined): T | undefined {
    if (!name) return undefined;
    const id = Number(/^(\d+)(-|$)/.exec(name)?.[1]);
    const withId = recipes.find((recipe) => recipe.id === id);

    // the address as it is built today
    if (withId && addressName(withId) === name) return withId;
    // An old link, which only has the title. It comes before reading a number at the start as the id,
    // so that an old link to "5 Minuten Brot" doesn't lead to recipe 5.
    return recipes.find((recipe) => recipeSlug(recipe.title) === name)
        // the recipe was renamed since the link was made
        ?? withId;
}

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

