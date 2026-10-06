import { describe, expect, it } from 'vitest';
import { Recipe } from '../types/Recipe';
import { filterRecipes } from './recipeFilter';

const recipe = (id: number, title: string, overrides: Partial<Recipe> = {}): Recipe => ({
    id,
    title,
    image: `${title}.jpg`,
    defaultPortions: 2,
    ingredients: [],
    preparation: [],
    cuisine: 'deutsch',
    tags: [],
    relatedRecipeIds: [],
    ...overrides,
});

const curry = recipe(1, 'Japanisches Curry', {
    cuisine: 'japanisch',
    ingredients: ['500 g Hähnchenbrust', '2 Karotten', '1 Zwiebel'],
});
const pizza = recipe(2, 'Pizza Margherita', {
    cuisine: 'italienisch',
    tags: ['VEGETARIAN'],
    ingredients: ['Für den Teig:', '250 g Mehl', '2 Tomaten', '125 g Käse'],
});
const falafel = recipe(3, 'Falafel Wrap', {
    cuisine: 'arabisch',
    tags: ['VEGAN'],
    ingredients: ['400 g Kichererbsen', '1 Zwiebel', '2 Tomaten'],
});
const pasta = recipe(4, 'Tomaten Pasta', {
    cuisine: 'italienisch',
    tags: ['VEGAN'],
    ingredients: ['250 g Nudeln', '1 Zwiebel'],
});

const all = [curry, pizza, falafel, pasta];
const titles = (recipes: Recipe[]) => recipes.map(r => r.title);

describe('filterRecipes', () => {
    it('returns every recipe in the same order without filters', () => {
        expect(filterRecipes(all, 'alle', 'alle', '')).toEqual(all);
    });

    describe('diet', () => {
        it('"vegetarisch" also contains the vegan recipes', () => {
            expect(titles(filterRecipes(all, 'vegetarisch', 'alle', ''))).toEqual(['Pizza Margherita', 'Falafel Wrap', 'Tomaten Pasta']);
        });

        it('"vegan" contains only the vegan recipes', () => {
            expect(titles(filterRecipes(all, 'vegan', 'alle', ''))).toEqual(['Falafel Wrap', 'Tomaten Pasta']);
        });
    });

    describe('cuisine', () => {
        it('keeps only the recipes of that cuisine', () => {
            expect(titles(filterRecipes(all, 'alle', 'italienisch', ''))).toEqual(['Pizza Margherita', 'Tomaten Pasta']);
        });

        it('returns nothing for a cuisine without recipes', () => {
            expect(filterRecipes(all, 'alle', 'mexikanisch', '')).toEqual([]);
        });
    });

    describe('search', () => {
        it('finds recipes by a part of the title, ignoring upper and lower case', () => {
            expect(titles(filterRecipes(all, 'alle', 'alle', 'CURRY'))).toEqual(['Japanisches Curry']);
            expect(titles(filterRecipes(all, 'alle', 'alle', 'wrap'))).toEqual(['Falafel Wrap']);
        });

        it('finds recipes by an ingredient', () => {
            expect(titles(filterRecipes(all, 'alle', 'alle', 'kichererbsen'))).toEqual(['Falafel Wrap']);
            expect(titles(filterRecipes(all, 'alle', 'alle', 'zwiebel'))).toEqual(['Japanisches Curry', 'Falafel Wrap', 'Tomaten Pasta']);
        });

        it('needs every comma-separated term to match', () => {
            expect(titles(filterRecipes(all, 'alle', 'alle', 'Tomate, Käse'))).toEqual(['Pizza Margherita']);
            expect(titles(filterRecipes(all, 'alle', 'alle', 'Tomate, Zwiebel'))).toEqual(['Falafel Wrap', 'Tomaten Pasta']);
        });

        it('lets one term match the title and another one an ingredient', () => {
            expect(titles(filterRecipes(all, 'alle', 'alle', 'pasta, nudeln'))).toEqual(['Tomaten Pasta']);
        });

        it('ignores spaces around the terms and empty terms', () => {
            expect(titles(filterRecipes(all, 'alle', 'alle', '  tomate ,, käse , '))).toEqual(['Pizza Margherita']);
            expect(filterRecipes(all, 'alle', 'alle', ' , ')).toEqual(all);
        });

        it('returns nothing when no recipe matches', () => {
            expect(filterRecipes(all, 'alle', 'alle', 'Lachs')).toEqual([]);
        });
    });

    it('combines diet, cuisine and search', () => {
        expect(titles(filterRecipes(all, 'vegan', 'italienisch', 'zwiebel'))).toEqual(['Tomaten Pasta']);
        expect(filterRecipes(all, 'vegan', 'japanisch', '')).toEqual([]);
    });

    it('returns nothing for an empty recipe list', () => {
        expect(filterRecipes([], 'alle', 'alle', '')).toEqual([]);
    });
});
