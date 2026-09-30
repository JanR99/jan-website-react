export interface Recipe {
    id: number;
    title: string;
    image: string;
    defaultPortions: number;
    ingredients: string[];
    preparation: string[];
    cuisine: string;
    tags: string[];
    relatedRecipeIds: number[];
}

export type RecipeRequest = Omit<Recipe, "id">;
