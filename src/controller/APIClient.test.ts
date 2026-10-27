import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl, operationPath, operationUrl, storedApi } from "./APIClient";
import RecipeController from "./RecipeController";

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

describe("operationPath", () => {
    const getPhoto = { path: "/api/travel/photos/{id}" };

    it("puts a parameter with a placeholder into the path", () => {
        expect(operationPath(getPhoto, { id: 12 })).toBe("/api/travel/photos/12");
    });

    it("puts the other parameters into the query", () => {
        expect(operationPath(getPhoto, { id: 12, preview: true })).toBe("/api/travel/photos/12?preview=true");
    });

    it("leaves out a parameter that is undefined", () => {
        expect(operationPath(getPhoto, { id: 12, preview: undefined })).toBe("/api/travel/photos/12");
    });

    it("encodes special characters", () => {
        expect(operationPath({ path: "/api/images/{id}" }, { id: "Char Koay Teow.jpg" })).toBe("/api/images/Char%20Koay%20Teow.jpg");
        expect(operationPath({ path: "/api/x" }, { q: "a&b" })).toBe("/api/x?q=a%26b");
    });

    it("gives the path itself without parameters", () => {
        expect(operationPath({ path: "/api/backup/export" })).toBe("/api/backup/export");
    });
});

describe("operationUrl", () => {
    it("is the absolute URL of the path", () => {
        expect(operationUrl({ path: "/api/travel/photos/{id}" }, { id: 12 })).toBe(apiUrl("/api/travel/photos/12"));
    });
});
