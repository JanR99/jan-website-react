import { apiUrl, operationPath, type Apis } from "../controller/APIClient";

const BRING_DEEPLINK = "https://api.getbring.com/rest/bringrecipes/deeplink";

/**
 * The link that puts a recipe on the Bring! shopping list. Bring! loads the page behind pageUrl, reads the
 * ingredients from it and answers with a redirect into the app (or the Bring! web app), where they can be
 * added to the list. The amounts are converted from basePortions to the portions asked for.
 */
export function bringImportUrl(pageUrl: string, basePortions: number, portions: number): string {
    const params = new URLSearchParams({
        url: pageUrl,
        source: "web",
        baseQuantity: String(basePortions),
        requestedQuantity: String(portions),
    });
    return `${BRING_DEEPLINK}?${params}`;
}

/**
 * The page of a recipe that Bring! loads. Bring! fetches it from its own servers, so a local backend can't be
 * reached; for local tests VITE_BRING_BACKEND_URL points to a tunnel to it (start-dev.ps1 -Bring sets it).
 */
export function bringPageUrl(apis: Apis, recipeId: number): string {
    const path = operationPath(apis.recipes.bringRecipe, { id: recipeId });
    const tunnel = import.meta.env.VITE_BRING_BACKEND_URL;
    return tunnel ? `${tunnel.replace(/\/+$/, "")}${path}` : apiUrl(path);
}
