import { useEffect, useSyncExternalStore } from "react";
import { Recipe } from "../types/Recipe";
import RecipeController from "../controller/RecipeController";

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
        pending = RecipeController.listRecipes()
            .then((recipes) => {
                loaded = true;
                setState({ recipes, loading: false, error: null });
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
