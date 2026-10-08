import { useEffect, useSyncExternalStore } from "react";
import { TravelFolder } from "../types/Travel";
import TravelController from "../controller/TravelController";
import { sortFolders, withoutPhoto } from "../utils/travel";

interface TravelFoldersState {
    folders: TravelFolder[];
    loading: boolean;
    error: string | null;
}

let state: TravelFoldersState = { folders: [], loading: true, error: null };
let loaded = false;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: Partial<TravelFoldersState>) {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function load(): Promise<void> {
    if (!pending) {
        pending = TravelController.listFolders()
            .then((folders) => {
                loaded = true;
                setState({ folders, loading: false, error: null });
            })
            .catch((err) => {
                console.error("Error loading travel folders:", err);
                setState({ loading: false, error: "Das Reisetagebuch konnte nicht geladen werden." });
            })
            .finally(() => {
                pending = null;
            });
    }
    return pending;
}

/** Loads the folders again, e.g. after a backup was restored. */
export function reloadTravelFolders(): Promise<void> {
    return load();
}

/** Puts a folder the backend returned after a change (created, renamed, photo added, …) into the list. */
export function storeTravelFolder(folder: TravelFolder): void {
    setState({ folders: sortFolders([...state.folders.filter((other) => other.id !== folder.id), folder]) });
}

/** Takes a deleted folder out of the list. */
export function dropTravelFolder(id: number): void {
    setState({ folders: state.folders.filter((folder) => folder.id !== id) });
}

/** Takes a deleted photo out of its folder. */
export function dropTravelPhoto(folderId: number, photoId: number): void {
    setState({
        folders: state.folders.map((folder) => (folder.id === folderId ? withoutPhoto(folder, photoId) : folder)),
    });
}

export function useTravelFolders() {
    const current = useSyncExternalStore(subscribe, () => state);

    useEffect(() => {
        if (!loaded) void load();
    }, []);

    return current;
}
