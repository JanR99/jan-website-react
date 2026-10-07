import { apiClient, apiUrl } from "../controller/APIClient";

/**
 * On the very first visit the service worker only takes over after the page has already loaded
 * its data, so none of it is stored yet. This tells the worker what the page has loaded so far;
 * it fetches again whatever it keeps for offline use (recipes, travel folders, recipe images, travel photos).
 * Without it the cookbook would only work offline from the second visit on.
 */
export async function storeRecipesForOffline(): Promise<void> {
    if (!("serviceWorker" in navigator) || navigator.serviceWorker.controller) return;

    const registration = await navigator.serviceWorker.ready;
    const urlsToCache = new Set([
        apiUrl("/v3/api-docs"),
        apiUrl(await apiClient.getPath("recipes", "listRecipes")),
        apiUrl(await apiClient.getPath("travel", "listTravelFolders")),
        ...performance.getEntriesByType("resource").map((entry) => entry.name),
    ]);
    registration.active?.postMessage({ type: "CACHE_URLS", payload: { urlsToCache: [...urlsToCache] } });
}
