import { isVegan, isVegetarian } from "./recipe";

export type Diet = 'alle' | 'vegetarisch' | 'vegan';

/**
 * Text in a form where the spelling doesn't matter: lower case, "ß" as "ss", accents and umlauts
 * without their dots ("Crème" → "creme", "Käse" → "kase"), and "ae"/"oe"/"ue" like the umlauts,
 * so "kase", "kaese" and "Käse" are all the same.
 */
export const normalizeSearchText = (text: string) =>
    text.toLowerCase()
        .replace(/ß/g, 'ss')
        .normalize('NFD').replace(/\p{M}/gu, '')
        .replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');

/**
 * A search word without a plural or other ending, so "Kartoffeln" also finds "1 Kartoffel" and
 * "Tomaten" also "1 Tomate". At least four letters stay, so "Käse" or "Reis" stay as they are.
 */
const stem = (term: string) => {
    for (const ending of ['en', 'n', 'e', 's']) {
        if (term.endsWith(ending) && term.length - ending.length >= 4) return term.slice(0, -ending.length);
    }
    return term;
};

/** The words of a search, split at spaces and commas, normalized and without endings. */
export const searchTerms = (search: string) =>
    normalizeSearchText(search).split(/[\s,]+/).filter(Boolean).map(stem);

/** Everything a search looks through apart from the title: ingredients, cuisine and diet. */
const searchableDetails = (recipe: Recipe) => normalizeSearchText([
    ...(recipe.ingredients ?? []).map(String),
    recipe.cuisine ?? '',
    isVegetarian(recipe) ? 'vegetarisch' : '',
    isVegan(recipe) ? 'vegan' : '',
].join('\n'));

/**
 * The recipes that fit the diet, the cuisine and every word of the search. Each search word may
 * be found in the title, an ingredient, the cuisine or the diet. Recipes with more search words in
 * the title come first; otherwise the order stays as it was.
 */
export const filterRecipes = (recipes: Recipe[], diet: Diet, cuisine: string, search: string) => {
    const terms = searchTerms(search);

    const matches = recipes.flatMap(r => {
        const matchesDiet =
            diet === 'alle' ||
            (diet === 'vegan' && isVegan(r)) ||
            (diet === 'vegetarisch' && isVegetarian(r));
        const matchesCuisine = cuisine === 'alle' || r.cuisine === cuisine;
        if (!matchesDiet || !matchesCuisine) return [];
        if (terms.length === 0) return [{ recipe: r, titleHits: 0 }];

        const title = normalizeSearchText(r.title);
        const details = searchableDetails(r);
        let titleHits = 0;
        for (const term of terms) {
            if (title.includes(term)) titleHits++;
            else if (!details.includes(term)) return [];
        }
        return [{ recipe: r, titleHits }];
    });

    // sort is stable, so recipes with as many title hits keep their order
    return matches.sort((a, b) => b.titleHits - a.titleHits).map(m => m.recipe);
};
