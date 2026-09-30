import { Recipe } from "../types/Recipe";
import ImageController from "../controller/ImageController";

const BASE = import.meta.env.BASE_URL;

export const recipeSlug = (title: string) => title.toLowerCase().replace(/\s+/g, "-");

export const recipePath = (recipe: Pick<Recipe, "title">) => `/cookbook/${recipeSlug(recipe.title)}`;

const withExtension = (image: string) => (image.includes(".") ? image : `${image}.jpg`);

export const recipeThumbnail = (recipe: Pick<Recipe, "image">) =>
    ImageController.getImageUrl(recipe.image) ?? `${BASE}Bilder/Essen-thumbnail/${withExtension(recipe.image)}`;

export const recipeImage = (recipe: Pick<Recipe, "image">) =>
    ImageController.getImageUrl(recipe.image) ?? `${BASE}Bilder/Essen-normal/${withExtension(recipe.image)}`;

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const isVegan = (recipe: Recipe) => recipe.tags?.includes("VEGAN") ?? false;
export const isVegetarian = (recipe: Recipe) =>
    isVegan(recipe) || (recipe.tags?.includes("VEGETARIAN") ?? false);

