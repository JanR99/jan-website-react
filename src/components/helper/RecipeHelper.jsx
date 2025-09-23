export const adjustIngredient = (ingredient, portions, defaultPortions = 2) => {
    const match = ingredient.match(/^(\d+(\.\d+)?)(\s*[^\d\s]+.*)?$/);
    if (match) {
        const quantity = parseFloat(match[1]);
        const unitAndName = match[3] || '';
        const adjustedQuantity = (quantity * portions) / defaultPortions;
        return `${adjustedQuantity} ${unitAndName}`.trim();
    }
    return ingredient;
};

export const renderIngredients = (recipe, adjustIngredient) => {
    if (!recipe.ingredients) return null;

    return recipe.ingredients.map((ingredient, index) => {
        // Check if the ingredient is a section header (e.g., ends with a colon ":")
        const isSectionHeader = ingredient.endsWith(":");

        return isSectionHeader ? (
            <li key={index} className="ingredient-section">
                <strong>{ingredient}</strong>
            </li>
        ) : (
            <li key={index} className="ingredient-item">
                <span className="ingredient-icon">🍴</span> {adjustIngredient(ingredient)}
            </li>
        );
    });
};

export const renderPreparationSteps = (recipe) => {
    if (!recipe.preparation) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return recipe.preparation.map((step, index) => {
        const parts = step.split(urlRegex); // Split the step into text and URL parts

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
