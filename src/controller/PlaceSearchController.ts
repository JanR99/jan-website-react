import { PlaceSearchResult } from "../types/Travel.ts";
import { parsePlaces } from "../utils/travel.ts";

const SEARCH_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Looks up places by name with Nominatim, the search of OpenStreetMap (no API key).
 * Its usage policy allows at most one request per second and no search-as-you-type,
 * so this is only called when the search button is pressed.
 */
export default class PlaceSearchController {

    /** At most five hits, the best one first. */
    static async search(query: string): Promise<PlaceSearchResult[]> {
        const params = new URLSearchParams({ q: query, format: "jsonv2", limit: "5", "accept-language": "de" });
        const response = await fetch(`${SEARCH_URL}?${params}`, { headers: { Accept: "application/json" } });
        if (!response.ok) {
            throw new Error(`Place search answered ${response.status}`);
        }
        return parsePlaces(await response.json());
    }
}
