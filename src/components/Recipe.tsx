import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adjustIngredient, renderIngredients, renderPreparationSteps } from './helper/RecipeHelper';
import '../styles/Recipe.css';

interface RecipeData {
    title: string;
    image: string;
    defaultPortions: number;
    ingredients: any[];
    preparation: string[];
    cuisine: string;
    tags?: string[];
}

const Recipe: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const passedRecipe = (location.state as { recipe?: RecipeData })?.recipe;
    const recipeTitle = passedRecipe?.title;
    const [recipe, setRecipe] = useState<RecipeData | null>(passedRecipe ?? null);
    const [portions, setPortions] = useState<number>(passedRecipe?.defaultPortions ?? 2);

    const handleBack = () => {
        navigate(`/cookbook`);
    };

    useEffect(() => {
        if (recipe == null || recipeTitle == null) return;
        const jsonFile = `/recipes/recipes.json`;

        fetch(jsonFile)
            .then(response => response.json())
            .then((data: RecipeData[]) => {
                const foundRecipe = data.find(
                    (r) =>
                        r.title.toLowerCase().replace(/\s+/g, '-') ===
                        recipeTitle.toLowerCase().replace(/\s+/g, '-')
                );

                if (foundRecipe) {
                    setRecipe(foundRecipe);
                    setPortions(foundRecipe.defaultPortions ?? 2);
                }
            })
            .catch(error => console.error('Error loading recipe:', error));
    }, [recipeTitle]);

    const handlePortionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        if (/^\d*$/.test(value)) {
            setPortions(value === '' ? 0 : parseInt(value, 10));
        }
    };

    const handlePortionInputBlur = () => {
        if (!portions || portions <= 0) {
            setPortions(1);
        }
    };

    if (!recipe) return <div>Loading recipe...</div>;

    let defaultPortions = recipe.defaultPortions ?? 2;
    return (
        <div>
            <header>
                <h1 className="header">{recipe.title}</h1>
            </header>

            {/* Back Button */}
            <div className="back">
                <button className="button-85" onClick={handleBack}>
                    Zurück
                </button>
            </div>

            {/* Recipe Image */}
            <div className="container-cookbook">
                <div className="img-cookbook">
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`/Bilder/Essen-normal/${recipe.image}`}
                    >
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
                    {renderIngredients(recipe, ingredient =>
                        adjustIngredient(ingredient, portions, defaultPortions)
                    )}
                </ul>
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
};

export default Recipe;
