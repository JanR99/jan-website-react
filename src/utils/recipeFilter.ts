import { Recipe } from "../types/Recipe";
import { isVegan, isVegetarian } from "./recipe";

export type Diet = 'alle' | 'vegetarisch' | 'vegan';

export const filterRecipes = (recipes: Recipe[], diet: Diet, cuisine: string, search: string) => {
    const terms = search.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

    return recipes.filter(r => {
        const matchesDiet =
            diet === 'alle' ||
            (diet === 'vegan' && isVegan(r)) ||
            (diet === 'vegetarisch' && isVegetarian(r));

        const matchesCuisine = cuisine === 'alle' || r.cuisine === cuisine;

        const matchesSearch = terms.every(term =>
            r.title.toLowerCase().includes(term) ||
            r.ingredients?.some(ingredient => String(ingredient).toLowerCase().includes(term))
        );

        return matchesDiet && matchesCuisine && matchesSearch;
    });
};
