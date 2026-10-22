import TravelController from "../controller/TravelController";
import { storedApi } from "../controller/APIClient";
import { sortFolders, withoutPhoto } from "../utils/travel";
import { createListStore } from "./createListStore";

const store = createListStore<TravelFolder>({
    readStored: () => TravelController.listFolders(storedApi),
    loadFresh: () => TravelController.listFolders(),
    name: "travel folders",
    errorMessage: "Das Reisetagebuch konnte nicht geladen werden.",
});

/** Loads the folders again, e.g. after a backup was restored. */
export function reloadTravelFolders(): Promise<void> {
    return store.reload();
}

/** Puts a folder the backend returned after a change (created, renamed, photo added, …) into the list. */
export function storeTravelFolder(folder: TravelFolder): void {
    store.update((folders) => sortFolders([...folders.filter((other) => other.id !== folder.id), folder]));
}

/** Takes a deleted folder out of the list. */
export function dropTravelFolder(id: number): void {
    store.update((folders) => folders.filter((folder) => folder.id !== id));
}

/** Takes a deleted photo out of its folder. */
export function dropTravelPhoto(folderId: number, photoId: number): void {
    store.update((folders) => folders.map((folder) => (folder.id === folderId ? withoutPhoto(folder, photoId) : folder)));
}

export function useTravelFolders() {
    const { items, loading, error } = store.useList();
    return { folders: items, loading, error };
}
