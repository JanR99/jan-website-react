import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl, storedApi } from "./APIClient";
import RecipeController from "./RecipeController";
import TravelController from "./TravelController";

const description = {
    paths: {
        "/api/recipes/list": { get: { tags: ["recipes"], operationId: "listRecipes" } },
        "/api/recipes/{id}": {
            put: { tags: ["recipes"], operationId: "updateRecipe" },
            delete: { tags: ["recipes"], operationId: "deleteRecipe" },
        },
        "/api/travel/folders/list": { get: { tags: ["travel"], operationId: "listTravelFolders" } },
    },
};

/** Stands in for the browser's cache storage, holding what the service worker has stored. */
function storeInCache(stored: Record<string, unknown>) {
    const byUrl = new Map(Object.entries(stored).map(([path, body]) => [apiUrl(path), body]));
    vi.stubGlobal("caches", {
        match: async (url: string) => (byUrl.has(url) ? new Response(JSON.stringify(byUrl.get(url))) : undefined),
    });
}

describe("storedApi", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("answers a controller with what is stored, found through the stored API description", async () => {
        storeInCache({ "/v3/api-docs": description, "/api/recipes/list": [{ id: 1, title: "Ramen" }] });

        expect(await RecipeController.listRecipes(storedApi)).toEqual([{ id: 1, title: "Ramen" }]);
    });

    it("gives folders stored by an older version the fields of today", async () => {
        storeInCache({
            "/v3/api-docs": description,
            "/api/travel/folders/list": [{ id: 7, name: "Japan", country: "Japan", coverPhotoId: 3, photoIds: [3, 4] }],
        });

        const [folder] = await TravelController.listFolders(storedApi);

        expect(folder.photos).toEqual([{ id: 3, caption: "" }, { id: 4, caption: "" }]);
        expect(folder.stops).toEqual([]);
    });

    it("fails when the API description is not stored", async () => {
        storeInCache({ "/api/recipes/list": [{ id: 1, title: "Ramen" }] });

        await expect(RecipeController.listRecipes(storedApi)).rejects.toThrow("Nothing stored");
    });

    it("fails instead of answering with an empty list when the answer is not stored", async () => {
        storeInCache({ "/v3/api-docs": description });

        await expect(RecipeController.listRecipes(storedApi)).rejects.toThrow("Nothing stored");
    });

    it("has no operation that is not kept for offline use", async () => {
        storeInCache({ "/v3/api-docs": description, "/api/recipes/list": [] });

        const apis = await storedApi;

        expect(apis.recipes.deleteRecipe).toBeUndefined();
    });

    it("fails in a browser without cache storage", async () => {
        await expect(RecipeController.listRecipes(storedApi)).rejects.toThrow();
    });
});
