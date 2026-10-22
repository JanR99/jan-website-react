import { Link, useLocation } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { isVegetarian, recipePath, recipeImage, RecipeLinkState } from '../utils/recipe';
import DietBadge from './DietBadge';
import { Heart } from "lucide-react";

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
                    {isVegetarian(recipe) && (
                        <div className="recipe-card-meta">
                            <DietBadge recipe={recipe} />
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
