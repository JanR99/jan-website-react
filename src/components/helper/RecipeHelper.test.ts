import { describe, expect, it } from 'vitest';
import { adjustIngredient, isSectionHeader } from './RecipeHelper';

describe('adjustIngredient', () => {
    it('leaves the ingredient unchanged at the default portions', () => {
        expect(adjustIngredient('200 g Mehl', 2, 2)).toBe('200 g Mehl');
    });

    it('scales a whole number up and down', () => {
        expect(adjustIngredient('200 g Mehl', 4, 2)).toBe('400 g Mehl');
        expect(adjustIngredient('200 g Mehl', 1, 2)).toBe('100 g Mehl');
    });

    it('scales a quantity written without a space before the unit', () => {
        expect(adjustIngredient('250ml Milch', 4, 2)).toBe('500ml Milch');
    });

    it('uses 2 as default portions when none are given', () => {
        expect(adjustIngredient('3 Eier', 4)).toBe('6 Eier');
    });

    it('reads decimals with a comma or a point and writes them with a comma', () => {
        expect(adjustIngredient('1,5 l Wasser', 4, 2)).toBe('3 l Wasser');
        expect(adjustIngredient('1.5 l Wasser', 1, 2)).toBe('0,75 l Wasser');
        expect(adjustIngredient('1 TL Salz', 1, 2)).toBe('0,5 TL Salz');
    });

    it('rounds to at most two decimal places', () => {
        expect(adjustIngredient('100 g Butter', 1, 3)).toBe('33,33 g Butter');
        expect(adjustIngredient('200 g Butter', 1, 3)).toBe('66,67 g Butter');
    });

    it('scales fractions', () => {
        expect(adjustIngredient('1/2 TL Zimt', 4, 2)).toBe('1 TL Zimt');
        expect(adjustIngredient('1/2 TL Zimt', 1, 2)).toBe('0,25 TL Zimt');
    });

    it('scales mixed numbers like "1 1/2"', () => {
        expect(adjustIngredient('1 1/2 EL Öl', 4, 2)).toBe('3 EL Öl');
    });

    it('scales both ends of a range and joins them with an en dash', () => {
        expect(adjustIngredient('2-3 Zehen Knoblauch', 4, 2)).toBe('4–6 Zehen Knoblauch');
        expect(adjustIngredient('2 - 3 Zehen Knoblauch', 4, 2)).toBe('4–6 Zehen Knoblauch');
    });

    it('leaves ingredients without a leading quantity unchanged', () => {
        expect(adjustIngredient('Salz und Pfeffer', 4, 2)).toBe('Salz und Pfeffer');
        expect(adjustIngredient('etwas Öl', 4, 2)).toBe('etwas Öl');
    });

    it('only scales the leading quantity, not numbers later in the text', () => {
        expect(adjustIngredient('2 Dosen Tomaten (400 g)', 4, 2)).toBe('4 Dosen Tomaten (400 g)');
    });

    it('leaves the ingredient unchanged while the portions field is empty', () => {
        expect(adjustIngredient('200 g Mehl', '', 2)).toBe('200 g Mehl');
    });

    it('leaves the ingredient unchanged when the default portions are 0', () => {
        expect(adjustIngredient('200 g Mehl', 4, 0)).toBe('200 g Mehl');
    });
});

describe('isSectionHeader', () => {
    it('treats a line ending with a colon as a section header', () => {
        expect(isSectionHeader('Für die Soße:')).toBe(true);
        expect(isSectionHeader('Für die Soße:  ')).toBe(true);
    });

    it('does not treat normal ingredients as section headers', () => {
        expect(isSectionHeader('200 g Mehl')).toBe(false);
        expect(isSectionHeader('Verhältnis 1:2 Wasser')).toBe(false);
    });
});
