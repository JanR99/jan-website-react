import { describe, expect, it } from 'vitest';
import { Recipe } from '../types/Recipe';
import {
    capitalize, isVegan, isVegetarian, openedFromCookbook, randomRecipe, recipeByAddress, recipeImage, recipePath, recipeSlug,
} from './recipe';

const recipe = (overrides: Partial<Recipe> = {}): Recipe => ({
    id: 1,
    title: 'Testrezept',
    image: 'testrezept.jpg',
    defaultPortions: 2,
    ingredients: [],
    preparation: [],
    cuisine: 'deutsch',
    tags: [],
    relatedRecipeIds: [],
    ...overrides,
});

describe('openedFromCookbook', () => {
    it('is true for a link in the cookbook', () => {
        expect(openedFromCookbook({ recipe: recipe(), from: '/cookbook' })).toBe(true);
    });

    it('is false for a link on another page, like "Passt dazu" on a recipe or a trip', () => {
        expect(openedFromCookbook({ recipe: recipe(), from: '/cookbook/ramen' })).toBe(false);
        expect(openedFromCookbook({ recipe: recipe(), from: '/reisen/7' })).toBe(false);
    });

    it('is false when the page was not reached by such a link', () => {
        expect(openedFromCookbook(null)).toBe(false);
        expect(openedFromCookbook(undefined)).toBe(false);
        expect(openedFromCookbook({ recipe: recipe() })).toBe(false);
    });
});

describe('recipeSlug', () => {
    it('lowercases the title and replaces spaces with hyphens', () => {
        expect(recipeSlug('Falafel Wrap')).toBe('falafel-wrap');
        expect(recipeSlug('Char Koay Teow')).toBe('char-koay-teow');
    });

    it('collapses several whitespace characters into one hyphen', () => {
        expect(recipeSlug('Abura   Soba')).toBe('abura-soba');
        expect(recipeSlug('Abura\tSoba')).toBe('abura-soba');
    });

    it('keeps umlauts and non-latin characters', () => {
        expect(recipeSlug('Käsespätzle')).toBe('käsespätzle');
        expect(recipeSlug('Baozi 包子')).toBe('baozi-包子');
    });
});

describe('recipePath', () => {
    it('builds the cookbook path from the id and the title', () => {
        expect(recipePath({ id: 12, title: 'Falafel Wrap' })).toBe('/cookbook/12-falafel-wrap');
    });

    it('keeps letters of other alphabets and umlauts', () => {
        expect(recipePath({ id: 3, title: 'Käsespätzle' })).toBe('/cookbook/3-käsespätzle');
        expect(recipePath({ id: 4, title: 'Baozi 包子' })).toBe('/cookbook/4-baozi-包子');
    });

    it('leaves out what would break an address', () => {
        expect(recipePath({ id: 7, title: 'Fish & Chips / Pommes?' })).toBe('/cookbook/7-fish-chips-pommes');
        expect(recipePath({ id: 8, title: 'Was ist #1?' })).toBe('/cookbook/8-was-ist-1');
    });

    it('is only the id for a title without letters or digits', () => {
        expect(recipePath({ id: 9, title: '???' })).toBe('/cookbook/9');
    });
});

describe('recipeByAddress', () => {
    const wrap = { id: 12, title: 'Falafel Wrap' };
    const bread = { id: 30, title: '5 Minuten Brot' };
    const curry = { id: 5, title: 'Curry' };
    const recipes = [wrap, bread, curry];

    it('finds the recipe of an address as recipePath builds it', () => {
        for (const each of recipes) {
            expect(recipeByAddress(recipes, recipePath(each).replace('/cookbook/', ''))).toBe(each);
        }
    });

    it('still finds the recipe after it was renamed', () => {
        const renamed = [{ id: 12, title: 'Falafel im Fladenbrot' }, bread, curry];

        expect(recipeByAddress(renamed, '12-falafel-wrap')).toBe(renamed[0]);
    });

    it('finds the recipe by the id alone', () => {
        expect(recipeByAddress(recipes, '12')).toBe(wrap);
    });

    it('finds the recipe of an old link, which only has the title', () => {
        expect(recipeByAddress(recipes, 'falafel-wrap')).toBe(wrap);
    });

    it('does not take the number at the start of an old link for an id', () => {
        expect(recipeByAddress(recipes, '5-minuten-brot')).toBe(bread);
    });

    it('finds nothing for an unknown address', () => {
        expect(recipeByAddress(recipes, 'gibt-es-nicht')).toBeUndefined();
        expect(recipeByAddress(recipes, '99-falafel-wrap')).toBeUndefined();
        expect(recipeByAddress(recipes, undefined)).toBeUndefined();
        expect(recipeByAddress(recipes, '')).toBeUndefined();
    });
});

describe('recipeImage', () => {
    it('points to the image endpoint of the backend', () => {
        expect(recipeImage({ image: 'curry.jpg' })).toMatch(/\/api\/images\/curry\.jpg$/);
    });

    it('drops the "uploads/" prefix of uploaded images', () => {
        expect(recipeImage({ image: 'uploads/12345' })).toMatch(/\/api\/images\/12345$/);
    });

    it('encodes special characters in the image name', () => {
        expect(recipeImage({ image: 'Char Koay Teow.jpg' })).toMatch(/\/api\/images\/Char%20Koay%20Teow\.jpg$/);
    });
});

describe('capitalize', () => {
    it('uppercases only the first letter', () => {
        expect(capitalize('vegetarisch')).toBe('Vegetarisch');
        expect(capitalize('japanisch')).toBe('Japanisch');
    });

    it('handles an empty text', () => {
        expect(capitalize('')).toBe('');
    });
});

describe('isVegan / isVegetarian', () => {
    it('recognizes a vegan recipe, which is also vegetarian', () => {
        const vegan = recipe({ tags: ['VEGAN'] });
        expect(isVegan(vegan)).toBe(true);
        expect(isVegetarian(vegan)).toBe(true);
    });

    it('recognizes a vegetarian recipe, which is not vegan', () => {
        const vegetarian = recipe({ tags: ['VEGETARIAN'] });
        expect(isVegan(vegetarian)).toBe(false);
        expect(isVegetarian(vegetarian)).toBe(true);
    });

    it('treats a recipe without tags as neither', () => {
        expect(isVegan(recipe())).toBe(false);
        expect(isVegetarian(recipe())).toBe(false);
    });
});

describe('randomRecipe', () => {
    const recipes = [recipe({ id: 1 }), recipe({ id: 2 }), recipe({ id: 3 })];

    it('picks by the random number: the first for 0, the last for just under 1', () => {
        expect(randomRecipe(recipes, undefined, () => 0)?.id).toBe(1);
        expect(randomRecipe(recipes, undefined, () => 0.5)?.id).toBe(2);
        expect(randomRecipe(recipes, undefined, () => 0.999999)?.id).toBe(3);
    });

    it('leaves out the excluded recipe', () => {
        expect(randomRecipe(recipes, 1, () => 0)?.id).toBe(2);
        expect(randomRecipe(recipes, 2, () => 0.5)?.id).toBe(3);
        expect(randomRecipe(recipes, 3, () => 0.999999)?.id).toBe(2);
    });

    it('never returns the excluded recipe, whatever the random number', () => {
        for (let i = 0; i < 200; i++) {
            expect(randomRecipe(recipes, 2)?.id).not.toBe(2);
        }
    });

    it('reaches every recipe', () => {
        const picked = new Set<number>();
        for (let step = 0; step < 30; step++) {
            picked.add(randomRecipe(recipes, undefined, () => step / 30)!.id);
        }
        expect([...picked].sort()).toEqual([1, 2, 3]);
    });

    it('returns the only recipe even if it is the excluded one', () => {
        expect(randomRecipe([recipe({ id: 7 })], 7)?.id).toBe(7);
    });

    it('ignores an excluded id that is not in the list', () => {
        expect(randomRecipe(recipes, 99, () => 0.999999)?.id).toBe(3);
    });

    it('returns undefined when there are no recipes', () => {
        expect(randomRecipe([])).toBeUndefined();
        expect(randomRecipe([], 1)).toBeUndefined();
    });
});
