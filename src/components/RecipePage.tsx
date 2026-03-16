import React, {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import { adjustIngredient, renderIngredients, renderPreparationSteps } from './helper/RecipeHelper';
import '../styles/Recipe.css';
import {Recipe} from "../types/Recipe";
import Navbar from "./Navbar";

const RecipePage: React.FC = () => {
    const location = useLocation();
    const recipe = (location.state as { recipe?: Recipe })?.recipe;
    const [portions, setPortions] = useState<number>(recipe?.defaultPortions ?? 2);
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        fetch("/recipes/recipes.json")
            .then(res => res.json())
            .then(data => setRecipes(data));
    }, []);

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

    const renderIngredientWithLinks = (ingredient: string) => {
        if (!recipe || !recipe.relatedRecipes) return ingredient;

        for (const relatedTitle of recipe.relatedRecipes) {
            if (ingredient.includes(relatedTitle)) {
                const slug = relatedTitle.toLowerCase().replace(/\s+/g, "-");
                const parts = ingredient.split(relatedTitle);
                return (
                    <>
                        {parts[0]}
                        <Link
                            to={`/cookbook/${slug}`}
                            state={{
                                recipe: recipes.find(r => r.title === relatedTitle)
                            }}
                        >
                            {relatedTitle}
                        </Link>
                        {parts[1]}
                    </>
                );
            }
        }

        return ingredient;
    };

    if (!recipe) return <div>Loading recipe...</div>;

    let defaultPortions = recipe.defaultPortions ?? 2;
    return (
        <div>
            {/* Navigation Bar */}
            <Navbar
                title={recipe.title}
                links={[
                    { to: "/cookbook", label: "zum Kochbuch" },
                ]}
            />

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
                    {renderIngredients(recipe, ingredient => {
                        const adjusted = adjustIngredient(ingredient, portions, defaultPortions);
                        return renderIngredientWithLinks(adjusted);
                    })}
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

export default RecipePage;
