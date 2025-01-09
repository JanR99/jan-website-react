import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Recipe() {
    const { category, recipeTitle } = useParams(); // Get category and recipeTitle from the URL
    const [recipe, setRecipe] = useState(null);

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

            {/* Ingredients Section */}
            <div className="zutaten">
                <h3 className="cookbook-h3">Zutaten</h3>
                <ul className="ingredients-list">
                    {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="ingredient-item">
                            <span className="ingredient-icon">🍴</span> {ingredient}
                        </li>
                    ))}
                </ul>
            </div>


            {/* Preparation Section */}
            <header>
                <h2>Zubereitung</h2>
            </header>
            <p className="zubereitung">
                {recipe.preparation && recipe.preparation.map((step, index) => (
                    <span key={index}>
                        {index + 1}. {step}
                        <br />
                    </span>
                ))}
            </p>
        </div>
    );
}

export default Recipe;
