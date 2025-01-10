import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adjustIngredient, renderIngredients, renderPreparationSteps } from './helper/RecipeHelper';
import '../styles/Recipe.css';

export default function Recipe() {
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
        if (portions <= 0) {
            setPortions(2);
        }
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
                <ul className="ingredients-list">{renderIngredients(recipe, (ingredient) => adjustIngredient(ingredient, portions))}</ul>
            </div>

            {/* Preparation Section */}
            <header>
                <h2>Zubereitung</h2>
            </header>
            <p className="zubereitung">
                {renderPreparationSteps(recipe)}
            </p>
        </div>
    );
}
