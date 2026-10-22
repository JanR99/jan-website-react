import { useEffect, useSyncExternalStore } from "react";
import { storedThenFresh } from "../utils/storedFirst";

export interface ListState<T> {
    items: T[];
    loading: boolean;
    error: string | null;
}

/**
 * A list from the backend that all pages share (recipes, travel folders): loaded once, by the first page
 * that needs it, and shown from the copy stored for offline use until the real answer arrives.
 */
export function createListStore<T>({ readStored, loadFresh, name, errorMessage }: {
    /** the copy stored on an earlier visit; fails when there is none */
    readStored: () => Promise<T[]>;
    /** the real answer from the backend */
    loadFresh: () => Promise<T[]>;
    /** for the console, like "recipes" */
    name: string;
    /** shown when the list couldn't be loaded */
    errorMessage: string;
}) {
    let state: ListState<T> = { items: [], loading: true, error: null };
    let loaded = false;
    let pending: Promise<void> | null = null;
    const listeners = new Set<() => void>();

    function setState(next: Partial<ListState<T>>) {
        state = { ...state, ...next };
        listeners.forEach((listener) => listener());
    }

    function subscribe(listener: () => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function load(): Promise<void> {
        if (!pending) {
            // a new try after a failure: back to the loading state, so the visitor sees that something happens
            if (state.error) setState({ loading: true, error: null });
            // only the first load starts with the stored copy; after that the page already shows something newer
            pending = storedThenFresh(
                loaded ? async () => null : readStored,
                loadFresh,
                (items) => setState({ items, loading: false, error: null }),
            )
                .then((freshArrived) => {
                    if (freshArrived) loaded = true;
                })
                .catch((err) => {
                    console.error(`Error loading ${name}:`, err);
                    setState({ loading: false, error: errorMessage });
                })
                .finally(() => {
                    pending = null;
                });
        }
        return pending;
    }

    return {
        /** Loads the list again, e.g. after an admin changed something. */
        reload: load,
        /** Changes the shown list without loading it, e.g. with what the backend returned after a change. */
        update(change: (items: T[]) => T[]): void {
            setState({ items: change(state.items) });
        },
        /** The list for a component; starts loading it if no page has done so yet. */
        useList(): ListState<T> {
            const current = useSyncExternalStore(subscribe, () => state);
            useEffect(() => {
                if (!loaded) void load();
            }, []);
            return current;
        },
    };
}
