import { useEffect, useState } from "react";
import { Recipe } from "../types/Recipe";

let cache: Recipe[] | null = null;
let pending: Promise<Recipe[]> | null = null;

function loadRecipes(): Promise<Recipe[]> {
    if (cache) return Promise.resolve(cache);
    if (!pending) {
        pending = fetch(`${import.meta.env.BASE_URL}recipes/recipes.json`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<Recipe[]>;
            })
            .then((data) => (cache = data))
            .finally(() => {
                pending = null;
            });
    }
    return pending;
}

export function useRecipes() {
    const [recipes, setRecipes] = useState<Recipe[]>(cache ?? []);
    const [loading, setLoading] = useState(cache === null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (cache) return;
        let active = true;
        loadRecipes()
            .then((data) => active && setRecipes(data))
            .catch((err) => {
                console.error("Error loading recipes:", err);
                if (active) setError("Die Rezepte konnten nicht geladen werden.");
            })
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, []);

    return { recipes, loading, error };
}
