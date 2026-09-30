import { apiClient } from "./APIClient.ts";

interface FavoritesResponse {
    body: string[];
}

export default class FavoritesController {

    static async getFavorites(): Promise<string[]> {
        const apis = await apiClient;
        const response: FavoritesResponse = await apis.favorites.getFavorites.execute({});
        return response.body ?? [];
    }

    static async addFavorite(title: string): Promise<string[]> {
        const apis = await apiClient;
        const response: FavoritesResponse = await apis.favorites.addFavorite.execute({}, { requestBody: { title } });
        return response.body ?? [];
    }

    static async removeFavorite(title: string): Promise<string[]> {
        const apis = await apiClient;
        const response: FavoritesResponse = await apis.favorites.removeFavorite.execute({}, { requestBody: { title } });
        return response.body ?? [];
    }
}
