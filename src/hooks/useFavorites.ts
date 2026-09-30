import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAuth } from "../components/auth/AuthContext";
import FavoritesController from "../controller/FavoritesController";

try {
    localStorage.removeItem("favoriteRecipes");
} catch {
    // storage not available – nothing to clean up
}

const EMPTY: number[] = [];

let snapshot: number[] = EMPTY;
let owner: string | null = null;
const listeners = new Set<() => void>();

function emit(next: number[]) {
    snapshot = next;
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function loadFor(email: string | null) {
    if (owner === email) return;
    owner = email;
    emit(EMPTY);
    if (!email) return;

    FavoritesController.getFavorites()
        .then((favorites) => {
            if (owner === email) emit(favorites);
        })
        .catch(() => {
            // leave the list empty; the next component that mounts retries
            if (owner === email) owner = null;
        });
}

export function useFavorites() {
    const { user, isAuthenticated, openAuthDialog } = useAuth();
    const email = user?.email ?? null;

    useEffect(() => {
        loadFor(email);
    }, [email]);

    const favorites = useSyncExternalStore(subscribe, () => (owner === email ? snapshot : EMPTY));

    const isFavorite = useCallback((recipeId: number) => favorites.includes(recipeId), [favorites]);

    const toggleFavorite = useCallback((recipeId: number) => {
        if (!isAuthenticated || !email) {
            openAuthDialog("login");
            return;
        }

        const previous = snapshot;
        const remove = previous.includes(recipeId);
        emit(remove ? previous.filter((id) => id !== recipeId) : [...previous, recipeId]);

        const request = remove
            ? FavoritesController.removeFavorite(recipeId)
            : FavoritesController.addFavorite(recipeId);

        request
            .then((serverList) => {
                if (owner === email) emit(serverList);
            })
            .catch(() => {
                if (owner === email) emit(previous);
            });
    }, [isAuthenticated, email, openAuthDialog]);

    return { favorites, isFavorite, toggleFavorite };
}
