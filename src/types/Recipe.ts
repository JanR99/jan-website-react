/** Same values as the backend enum de.jan.recipe.RecipeTag, with their German labels. */
export const RECIPE_TAGS = {
    VEGETARIAN: "vegetarisch",
    VEGAN: "vegan",
} as const;

export type RecipeTag = keyof typeof RECIPE_TAGS;

export interface Recipe {
    id: number;
    title: string;
    image: string;
    defaultPortions: number;
    ingredients: string[];
    preparation: string[];
    cuisine: string;
    tags: RecipeTag[];
    relatedRecipeIds: number[];
}

export type RecipeRequest = Omit<Recipe, "id">;

export interface ImageUploadResponse {
    image: string;
}
