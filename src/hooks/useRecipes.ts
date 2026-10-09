import { useEffect, useSyncExternalStore } from "react";
import { Recipe } from "../types/Recipe";
import RecipeController from "../controller/RecipeController";
import { storedApi } from "../controller/APIClient";
import { storedThenFresh } from "../utils/storedFirst";

interface RecipesState {
    recipes: Recipe[];
    loading: boolean;
    error: string | null;
}

let state: RecipesState = { recipes: [], loading: true, error: null };
let loaded = false;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: Partial<RecipesState>) {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function load(): Promise<void> {
    if (!pending) {
        // only the first load starts with the stored copy; after that the page already shows something newer
        const readStored = loaded ? async () => null : () => RecipeController.listRecipes(storedApi);
        pending = storedThenFresh(
            readStored,
            () => RecipeController.listRecipes(),
            (recipes) => setState({ recipes, loading: false, error: null }),
        )
            .then((freshArrived) => {
                if (freshArrived) loaded = true;
            })
            .catch((err) => {
                console.error("Error loading recipes:", err);
                setState({ loading: false, error: "Die Rezepte konnten nicht geladen werden." });
            })
            .finally(() => {
                pending = null;
            });
    }
    return pending;
}

/** Loads the recipes again, e.g. after an admin changed one. */
export function reloadRecipes(): Promise<void> {
    return load();
}

export function useRecipes() {
    const current = useSyncExternalStore(subscribe, () => state);

    useEffect(() => {
        if (!loaded) void load();
    }, []);

    return current;
}
