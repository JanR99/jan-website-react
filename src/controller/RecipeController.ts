import { Api, apiClient } from "./APIClient.ts";
import { Recipe, RecipeRequest } from "../types/Recipe.ts";

export default class RecipeController {

    /** @param api storedApi for the list as it was stored on an earlier visit; that fails when there is none */
    static async listRecipes(api: Api = apiClient): Promise<Recipe[]> {
        const apis = await api;
        const response: { body: Recipe[] } = await apis.recipes.listRecipes.execute({});
        return response.body ?? [];
    }

    static async createRecipe(req: RecipeRequest): Promise<Recipe> {
        const apis = await apiClient;
        const response: { body: Recipe } = await apis.recipes.createRecipe.execute({}, { requestBody: req });
        return response.body;
    }

    static async updateRecipe(id: number, req: RecipeRequest): Promise<Recipe> {
        const apis = await apiClient;
        const response: { body: Recipe } = await apis.recipes.updateRecipe.execute({ id }, { requestBody: req });
        return response.body;
    }

    static async deleteRecipe(id: number): Promise<void> {
        const apis = await apiClient;
        await apis.recipes.deleteRecipe.execute({ id });
    }
}
