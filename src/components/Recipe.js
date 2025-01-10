import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Recipe.css';

function Recipe() {
    const { category, recipeTitle } = useParams(); // Get category and recipeTitle from the URL
    const [recipe, setRecipe] = useState(null);
    const [portions, setPortions] = useState(2); // Default portions to 2

    useEffect(() => {
        // Dynamically fetch the correct JSON file based on the category
        const jsonFile = `/recipes/${category}.json`; // Build the correct JSON file path

        // Fetch the JSON file from the public folder
        fetch(jsonFile)
            .then(response => response.json())
            .then(data => {
                // Find the recipe based on the title
                const foundRecipe = data.find(
                    (r) => r.title.toLowerCase().replace(/\s+/g, '-') === recipeTitle.toLowerCase().replace(/\s+/g, '-')
                );
                setRecipe(foundRecipe);
            })
            .catch(error => console.error('Error loading recipe:', error));
    }, [category, recipeTitle]);

    const handlePortionInputChange = (e) => {
        const value = e.target.value.trim();
        if (/^\d+$/.test(value)) {
            setPortions(parseInt(value, 10));
        } else if (value === '') {
            setPortions('');
        }
    };

    const handlePortionInputBlur = () => {
        if (portions === '' || portions <= 0) {
            setPortions(2); // Reset to default if input is invalid
        }
    };

    const adjustIngredient = (ingredient) => {
        // Extract quantity and unit if available
        const match = ingredient.match(/^(\d+(\.\d+)?)(\s*[^\d\s]+.*)?$/); // Matches numbers and optional units
        if (match) {
            const quantity = parseFloat(match[1]);
            const unitAndName = match[3] || ''; // Everything after the quantity
            const adjustedQuantity = (quantity * portions) / 2; // Adjust quantity based on portions
            return `${adjustedQuantity} ${unitAndName}`.trim();
        }
        return ingredient; // Return ingredient as-is if no quantity is found
    };

    if (!recipe) {
        return <div></div>; // This is needed. Otherwise, it throws an error.
    }

    return (
        <div>
            <header>
                <h1 className="header">{recipe.title}</h1>
            </header>

            {/* Back Button */}
            <div className="back">
                <button className="button-85" onClick={() => window.history.back()}>
                    Zurück
                </button>
            </div>

            {/* Recipe Image */}
            <div className="container-cookbook">
                <div className="img-cookbook">
                    <a target="_blank" rel="noopener noreferrer" href={`/Bilder/Essen-normal/${recipe.image}`}>
                        <img
                            src={`/Bilder/Essen-thumbnail/${recipe.image}`}
                            alt={recipe.title}
                        />
                    </a>
                </div>
            </div>

            {/* Portion Selector */}
            <div className="portion-selector">
                <label htmlFor="portions">Portionen:</label>
                <input
                    id="portions"
                    type="text"
                    value={portions}
                    onChange={handlePortionInputChange}
                    onBlur={handlePortionInputBlur}
                    placeholder="Portionenanzahl"
                />
            </div>


            {/* Ingredients Section */}
            <div className="zutaten">
                <h3 className="cookbook-h3">Zutaten</h3>
                <ul className="ingredients-list">
                    {recipe.ingredients && recipe.ingredients.map((ingredient, index) => {
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
                    })}
                </ul>
            </div>

            {/* Preparation Section */}
            <header>
                <h2>Zubereitung</h2>
            </header>
            <p className="zubereitung">
                {recipe.preparation && recipe.preparation.map((step, index) => {
                    // Check if the step contains a URL
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
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
                })}
            </p>
        </div>
    );
}

export default Recipe;
