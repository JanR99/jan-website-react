import { ReactNode } from 'react';

const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

const parseQuantity = (raw: string): number => {
    const value = raw.trim().replace(',', '.');
    const mixed = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
    const fraction = value.match(/^(\d+)\/(\d+)$/);
    if (fraction) return Number(fraction[1]) / Number(fraction[2]);
    return parseFloat(value);
};

const QUANTITY = String.raw`\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?`;
const INGREDIENT_PATTERN = new RegExp(`^(${QUANTITY})(?:\\s*-\\s*(${QUANTITY}))?(.*)$`);

export const adjustIngredient = (
    ingredient: string,
    portions: number | "",
    defaultPortions: number = 2
): string => {
    const match = ingredient.match(INGREDIENT_PATTERN);
    if (!match || typeof portions !== "number" || !defaultPortions) return ingredient;

    const factor = portions / defaultPortions;
    const scale = (raw: string) => numberFormat.format(parseQuantity(raw) * factor);

    const [, from, to, rest] = match;
    return `${scale(from)}${to ? `–${scale(to)}` : ''}${rest}`;
};

export const isSectionHeader = (ingredient: string) => ingredient.trim().endsWith(":");

export const renderIngredients = (
    recipe: { ingredients?: string[] },
    adjustFn: (ingredient: string, index: number) => ReactNode
) => {
    if (!recipe.ingredients) return null;

    return recipe.ingredients.map((ingredient, index) =>
        isSectionHeader(ingredient) ? (
            <li key={index} className="ingredient-section">
                {ingredient.replace(/:\s*$/, '')}
            </li>
        ) : (
            adjustFn(ingredient, index)
        )
    );
};

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const renderStepText = (step: string): ReactNode =>
    step.split(URL_REGEX).map((part, i) =>
        /^https?:\/\//.test(part) ? (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer">
                {part}
            </a>
        ) : (
            part
        )
    );
