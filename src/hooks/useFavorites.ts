import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "favoriteRecipes";
const listeners = new Set<() => void>();

function read(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
        return [];
    }
}

let snapshot: string[] = read();

function write(next: string[]) {
    snapshot = next;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // Storage nicht verfügbar – Favoriten leben dann nur in dieser Sitzung
    }
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) {
            snapshot = read();
            listener();
        }
    };
    window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
    };
}

export function useFavorites() {
    const favorites = useSyncExternalStore(subscribe, () => snapshot);

    const isFavorite = useCallback((title: string) => favorites.includes(title), [favorites]);

    const toggleFavorite = useCallback((title: string) => {
        write(snapshot.includes(title) ? snapshot.filter((t) => t !== title) : [...snapshot, title]);
    }, []);

    return { favorites, isFavorite, toggleFavorite };
}
