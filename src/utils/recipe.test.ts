import { describe, expect, it } from 'vitest';
import { Recipe } from '../types/Recipe';
import { capitalize, isVegan, isVegetarian, recipeImage, recipePath, recipeSlug } from './recipe';

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
    it('builds the cookbook path from the title', () => {
        expect(recipePath({ title: 'Falafel Wrap' })).toBe('/cookbook/falafel-wrap');
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
