import { Link, useLocation } from 'react-router-dom';
import { Recipe } from '../types/Recipe';
import { useFavorites } from '../hooks/useFavorites';
import { isVegan, isVegetarian, recipePath, recipeImage, RecipeLinkState } from '../utils/recipe';
import { Heart, Leaf } from "lucide-react";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorite = isFavorite(recipe.id);
    const ingredientCount = recipe.ingredients?.filter(i => !String(i).trim().endsWith(':')).length ?? 0;
    const linkState: RecipeLinkState = { recipe, from: useLocation().pathname };

    return (
        <article className="recipe-card">
            <Link to={recipePath(recipe)} state={linkState} className="recipe-card-link">
                <div className="recipe-card-image">
                    <img src={recipeImage(recipe)} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="recipe-card-body">
                    <span className="recipe-card-kicker">
                        {[recipe.cuisine, `${ingredientCount} Zutaten`].filter(Boolean).join(' · ')}
                    </span>
                    <h3>{recipe.title}</h3>
                    {(isVegan(recipe) || isVegetarian(recipe)) && (
                        <div className="recipe-card-meta">
                            <span className="badge badge--green">
                                <Leaf size={12} /> {isVegan(recipe) ? 'vegan' : 'vegetarisch'}
                            </span>
                        </div>
                    )}
                </div>
            </Link>
            <button
                type="button"
                className={`favorite-button${favorite ? ' is-active' : ''}`}
                onClick={() => toggleFavorite(recipe.id)}
                aria-pressed={favorite}
                aria-label={favorite ? `${recipe.title} aus Favoriten entfernen` : `${recipe.title} zu Favoriten hinzufügen`}
            >
                <Heart size={18} fill={favorite ? "currentColor" : "none"} />
            </button>
        </article>
    );
}
