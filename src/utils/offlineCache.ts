import { apiClient, apiUrl } from "../controller/APIClient";

/**
 * On the very first visit the service worker only takes over after the page has already loaded
 * its data, so none of it is stored yet. This asks the worker to fetch the recipes once more for
 * its cache; without it the cookbook would only work offline from the second visit on.
 */
export async function storeRecipesForOffline(): Promise<void> {
    if (!("serviceWorker" in navigator) || navigator.serviceWorker.controller) return;

    const registration = await navigator.serviceWorker.ready;
    const urlsToCache = [
        apiUrl("/v3/api-docs"),
        apiUrl(await apiClient.getPath("recipes", "listRecipes")),
    ];
    registration.active?.postMessage({ type: "CACHE_URLS", payload: { urlsToCache } });
}
