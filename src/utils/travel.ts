import { Recipe } from "../types/Recipe";
import { PlaceSearchResult, TravelFolder, TravelPhoto, TravelPosition } from "../types/Travel";

export const TRAVEL_BASE = "/reisen";

export const travelFolderPath = (folder: Pick<TravelFolder, "id">) => `${TRAVEL_BASE}/${folder.id}`;

/** Same order as the backend: the newest trip first, the ones without a date after them by name. */
export function sortFolders(folders: TravelFolder[]): TravelFolder[] {
    return [...folders].sort((a, b) => {
        if (a.startMonth !== b.startMonth) {
            if (a.startMonth === null) return 1;
            if (b.startMonth === null) return -1;
            // "2024-05" sorts by time as a text
            return a.startMonth < b.startMonth ? 1 : -1;
        }
        return a.name.localeCompare(b.name, "de");
    });
}

/** The folder after one of its photos was deleted; if that was the cover, the first photo takes over. */
export function withoutPhoto(folder: TravelFolder, photoId: number): TravelFolder {
    const photos = folder.photos.filter((photo) => photo.id !== photoId);
    const coverPhotoId = folder.coverPhotoId === photoId ? photos[0]?.id ?? null : folder.coverPhotoId;
    return { ...folder, photos, coverPhotoId };
}

/** What a photo shows, for screen readers: its caption, otherwise the folder and its place in it. */
export function photoDescription(folderName: string, photo: Pick<TravelPhoto, "caption">, index: number): string {
    return photo.caption.trim() || `${folderName} ${index + 1}`;
}

export const CAPTION_MAX_LENGTH = 200;

/** A caption the way the backend stores it: without spaces around it and with single spaces inside. */
export function cleanCaption(caption: string): string {
    return caption.trim().replace(/\s+/g, " ");
}

/** The country is only shown if it says more than the name (not for "Andorra" in "Andorra"). */
export function folderCountry(folder: Pick<TravelFolder, "name" | "country">): string | null {
    const country = folder.country.trim();
    return country && country.toLowerCase() !== folder.name.trim().toLowerCase() ? country : null;
}

export const MONTH_NAMES = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/** Year and month of a text like "2024-05", null if it is none. */
function parseMonth(value: string | null): { year: number; month: number } | null {
    const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value ?? "");
    return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
}

/** When the trip was: "Mai 2024", "Mai – Juni 2024" or "Dezember 2023 – Januar 2024"; null if that is not known. */
export function travelPeriod(folder: Pick<TravelFolder, "startMonth" | "endMonth">): string | null {
    const start = parseMonth(folder.startMonth);
    if (!start) return null;
    const startName = MONTH_NAMES[start.month - 1];
    const end = parseMonth(folder.endMonth);
    if (!end || (end.year === start.year && end.month === start.month)) {
        return `${startName} ${start.year}`;
    }
    const endLabel = `${MONTH_NAMES[end.month - 1]} ${end.year}`;
    return end.year === start.year ? `${startName} – ${endLabel}` : `${startName} ${start.year} – ${endLabel}`;
}

/** The small line above the name of a folder: country and time of the trip, as far as they are known. */
export function folderSubtitle(folder: Pick<TravelFolder, "name" | "country" | "startMonth" | "endMonth">): string | null {
    return [folderCountry(folder), travelPeriod(folder)].filter(Boolean).join(" · ") || null;
}

/**
 * The two parts of a month field the way the backend wants a month: "2024-05",
 * null if both are empty, undefined if only one of them is filled in or the year is none.
 *
 * @param year the year of the travel
 * @param month "01" to "12", or empty
 */
export function toMonth(year: string, month: string): string | null | undefined {
    const yearText = year.trim();
    if (!yearText && !month) return null;
    const value = `${yearText}-${month}`;
    const parsed = parseMonth(value);
    return parsed && parsed.year >= 1900 && parsed.year <= 2100 ? value : undefined;
}

/** A cuisine the way it is compared: "Japanisch " is the same one as "japanisch". */
const cuisineKey = (cuisine: string | undefined) => (cuisine ?? "").trim().toLowerCase();

/** The recipes shown with a trip: the ones of its cuisine, none if the trip has no cuisine. */
export function folderRecipes(folder: Pick<TravelFolder, "cuisine">, recipes: Recipe[]): Recipe[] {
    const cuisine = cuisineKey(folder.cuisine);
    return cuisine ? recipes.filter((recipe) => cuisineKey(recipe.cuisine) === cuisine) : [];
}

/** The trips shown with a recipe: the ones with its cuisine, in the order of the folders. */
export function recipeFolders(recipe: Pick<Recipe, "cuisine">, folders: TravelFolder[]): TravelFolder[] {
    const cuisine = cuisineKey(recipe.cuisine);
    return cuisine ? folders.filter((folder) => cuisineKey(folder.cuisine) === cuisine) : [];
}

export const TEXT_MAX_LENGTH = 10_000;

/** The paragraphs of a folder's text; they are separated by empty lines. */
export function textParagraphs(text: string): string[] {
    return text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

export function photoCountLabel(count: number): string {
    if (count === 0) return "Noch keine Fotos";
    return count === 1 ? "1 Foto" : `${count} Fotos`;
}

function isCoordinate(value: unknown, limit: number): value is number {
    return typeof value === "number" && Math.abs(value) <= limit;
}

/** Where the folder is shown on the map, null if it has no place on it. */
export function folderPosition(folder: Pick<TravelFolder, "latitude" | "longitude">): TravelPosition | null {
    const { latitude, longitude } = folder;
    return isCoordinate(latitude, 90) && isCoordinate(longitude, 180) ? { latitude, longitude } : null;
}

/** Five decimals are about one metre, anything finer is noise. */
export function roundPosition(latitude: number, longitude: number): TravelPosition {
    const round = (value: number) => Math.round(value * 1e5) / 1e5;
    return { latitude: round(latitude), longitude: round(longitude) };
}

/** The answer of the place search (Nominatim) as places; entries without usable coordinates are left out. */
export function parsePlaces(body: unknown): PlaceSearchResult[] {
    if (!Array.isArray(body)) return [];
    const places: PlaceSearchResult[] = [];
    for (const entry of body as Array<Record<string, unknown> | null>) {
        // Nominatim sends the coordinates as strings
        const latitude = Number.parseFloat(String(entry?.lat));
        const longitude = Number.parseFloat(String(entry?.lon));
        const label = typeof entry?.display_name === "string" ? entry.display_name.trim() : "";
        if (label && isCoordinate(latitude, 90) && isCoordinate(longitude, 180)) {
            places.push({ label, ...roundPosition(latitude, longitude) });
        }
    }
    return places;
}
