import { apiClient } from "./APIClient.ts";

interface FavoritesResponse {
    body: number[];
}

export default class FavoritesController {

    static async getFavorites(): Promise<number[]> {
        const apis = await apiClient;
        const response: FavoritesResponse = await apis.favorites.getFavorites.execute({});
        return response.body ?? [];
    }

    static async addFavorite(recipeId: number): Promise<number[]> {
        const apis = await apiClient;
        const response: FavoritesResponse = await apis.favorites.addFavorite.execute({}, { requestBody: { recipeId } });
        return response.body ?? [];
    }

    static async removeFavorite(recipeId: number): Promise<number[]> {
        const apis = await apiClient;
        const response: FavoritesResponse = await apis.favorites.removeFavorite.execute({}, { requestBody: { recipeId } });
        return response.body ?? [];
    }
}
