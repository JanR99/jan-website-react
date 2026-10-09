import { Recipe } from "../types/Recipe";
import { PlaceSearchResult, TravelFolder, TravelPhoto, TravelPosition, TravelStop } from "../types/Travel";
import { chosenByChance } from "./chance";

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

/**
 * The list with the item at the place `from` moved to the place `to`; the ones in between move up.
 * A copy in the same order if one of the places is not in the list.
 */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
    const moved = [...items];
    if (from < 0 || from >= items.length || to < 0 || to >= items.length) return moved;
    moved.splice(to, 0, ...moved.splice(from, 1));
    return moved;
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

/**
 * Photos for the collage on the home page, chosen by chance: one photo each from as many different
 * trips as asked for. With fewer trips that have photos there are fewer photos.
 *
 * @param folders the TravelFolders
 * @param count the maximum number
 * @param seed a random number from 0 to 1, drawn once per visit
 */
export function collagePhotos(folders: Pick<TravelFolder, "id" | "photos">[], count: number, seed: number): TravelPhoto[] {
    const withPhotos = folders.filter((folder) => folder.photos.length > 0);
    return chosenByChance(withPhotos, count, seed).map((folder) => chosenByChance(folder.photos, 1, seed)[0]);
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

/** The stops of a folder that can be shown on the map, in the order of the trip. */
export function folderStops(folder: Pick<TravelFolder, "stops">): TravelStop[] {
    return (folder.stops ?? []).filter((stop) => isCoordinate(stop.latitude, 90) && isCoordinate(stop.longitude, 180));
}

/** The stop closest to the middle of all stops: where a folder shown as one pin has it, always on a real place. */
export function centralStop(stops: TravelStop[]): TravelStop {
    const latitudes = stops.map((stop) => stop.latitude);
    const longitudes = stops.map((stop) => stop.longitude);
    const middle = {
        latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
        longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    };
    const distance = (stop: TravelStop) => Math.hypot(stop.latitude - middle.latitude, stop.longitude - middle.longitude);
    return stops.reduce((best, stop) => (distance(stop) < distance(best) ? stop : best));
}

/**
 * The folders that are tiny at the current zoom: even their two stops furthest apart are closer on the
 * screen than minSize pixels. Such a folder is shown as one pin. As soon as the trip is larger, all its
 * stops are shown, also if some of them still cover each other.
 *
 * @param folders the folders including the travel information
 * @param toPoint where a place is on the screen at the current zoom, in pixels
 * @param minSize the minimal size
 */
export function crowdedFolders(
    folders: TravelFolder[],
    toPoint: (position: TravelPosition) => { x: number; y: number },
    minSize: number
): Set<number> {
    const crowded = new Set<number>();
    for (const folder of folders) {
        const points = folderStops(folder).map(toPoint);
        if (points.length < 2) continue;
        const largeEnough = points.some((a, i) =>
            points.slice(i + 1).some((b) => Math.hypot(a.x - b.x, a.y - b.y) >= minSize)
        );
        if (!largeEnough) crowded.add(folder.id);
    }
    return crowded;
}

/** A pin on the map: a stop of a folder, or a whole folder shown as one pin. */
export interface MapPin {
    key: string;
    folder: TravelFolder;
    /** the stop; for a whole folder its central stop */
    stop: TravelStop;
    /** true if the pin stands for all stops of the folder */
    wholeFolder: boolean;
}

/**
 * What the map shows: the pins, and the lines along the trips. A folder in crowded is one pin at its
 * central stop and has no line of its own; every folder's line starts at the folder the trip came
 * from (its last stop, or its one pin). A single point makes no line and is left out.
 */
export function mapLayout(folders: TravelFolder[], crowded: Set<number>): { pins: MapPin[]; lines: TravelPosition[][] } {
    // the places each folder is shown with, in the order of the trip
    const shown = new Map<number, TravelStop[]>();
    for (const folder of folders) {
        const stops = folderStops(folder);
        if (stops.length > 0) shown.set(folder.id, crowded.has(folder.id) ? [centralStop(stops)] : stops);
    }

    const pins: MapPin[] = [];
    const lines: TravelPosition[][] = [];
    for (const folder of folders) {
        const places = shown.get(folder.id);
        if (!places) continue;
        const wholeFolder = crowded.has(folder.id);
        places.forEach((stop, index) =>
            pins.push({ key: wholeFolder ? `${folder.id}-all` : `${folder.id}-${index}`, folder, stop, wholeFolder })
        );

        const previous = folder.previousFolderId === null ? undefined : shown.get(folder.previousFolderId);
        const from = previous ? [previous[previous.length - 1]] : [];
        const line = [...from, ...places].map(({ latitude, longitude }) => ({ latitude, longitude }));
        if (line.length > 1) lines.push(line);
    }
    return { pins, lines };
}

/** The name of a stop from a place the search found: its first part, "Sevilla" of "Sevilla, Andalusien, Spanien". */
export function placeName(label: string): string {
    return label.split(",")[0].trim();
}

export const MAX_STOPS = 30;

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
