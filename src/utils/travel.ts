import { TravelFolder } from "../types/Travel";

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
