import { PlaceSearchResult, TravelFolder, TravelPosition } from "../types/Travel";

export const TRAVEL_BASE = "/reisen";

export const travelFolderPath = (folder: Pick<TravelFolder, "id">) => `${TRAVEL_BASE}/${folder.id}`;

/** Same order as the backend: by name. */
export function sortFolders(folders: TravelFolder[]): TravelFolder[] {
    return [...folders].sort((a, b) => a.name.localeCompare(b.name, "de"));
}

/** The folder after one of its photos was deleted; if that was the cover, the first photo takes over. */
export function withoutPhoto(folder: TravelFolder, photoId: number): TravelFolder {
    const photoIds = folder.photoIds.filter((id) => id !== photoId);
    const coverPhotoId = folder.coverPhotoId === photoId ? photoIds[0] ?? null : folder.coverPhotoId;
    return { ...folder, photoIds, coverPhotoId };
}

/** The country is only shown if it says more than the name (not for "Andorra" in "Andorra"). */
export function folderCountry(folder: Pick<TravelFolder, "name" | "country">): string | null {
    const country = folder.country.trim();
    return country && country.toLowerCase() !== folder.name.trim().toLowerCase() ? country : null;
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
