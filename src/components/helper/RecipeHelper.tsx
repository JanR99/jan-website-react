import React from 'react';

export const adjustIngredient = (
    ingredient: string,
    portions: number | "",
    defaultPortions: number = 2
): string => {
    const match = ingredient.match(/^(\d+(\.\d+)?)(\s*[^\d\s]+.*)?$/);
    if (match && typeof portions === "number") {
        const quantity = parseFloat(match[1]);
        const unitAndName = match[3] || '';
        const adjustedQuantity = (quantity * portions) / defaultPortions;
        return `${adjustedQuantity} ${unitAndName}`.trim();
    }
    return ingredient;
};

export const renderIngredients = (
    recipe: { ingredients?: string[] },
    adjustFn: (ingredient: string) => string
) => {
    if (!recipe.ingredients) return null;

    return recipe.ingredients.map((ingredient, index) => {
        const isSectionHeader = ingredient.endsWith(":");

        return isSectionHeader ? (
            <li key={index} className="ingredient-section">
                <strong>{ingredient}</strong>
            </li>
        ) : (
            <li key={index} className="ingredient-item">
                <span className="ingredient-icon">🍴</span> {adjustFn(ingredient)}
            </li>
        );
    });
};

export const renderPreparationSteps = (
    recipe: { preparation?: string[] }
) => {
    if (!recipe.preparation) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return recipe.preparation.map((step, index) => {
        const parts = step.split(urlRegex);

        return (
            <span key={index}>
        {index + 1}.{" "}
                {parts.map((part, i) =>
                    urlRegex.test(part) ? (
                        <a key={i} href={part} target="_blank" rel="noopener noreferrer">
                            {part}
                        </a>
                    ) : (
                        part
                    )
                )}
                <br />
      </span>
        );
    });
};
