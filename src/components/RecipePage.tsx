import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { adjustIngredient, renderIngredients, renderStepText } from './helper/RecipeHelper';
import { Recipe } from '../types/Recipe';
import { useRecipes } from '../hooks/useRecipes';
import { useFavorites } from '../hooks/useFavorites';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTravelFolders } from '../hooks/useTravelFolders';
import { isVegan, isVegetarian, recipeImage, recipePath, recipeSlug } from '../utils/recipe';
import { recipeFolders } from '../utils/travel';
import RecipeCard from './RecipeCard';
import TravelFolderLink from './travel/TravelFolderLink';
import CookMode from './CookMode';
import RecipePrintSheet from './RecipePrintSheet';
import { ArrowLeft, Check, CookingPot, Heart, Leaf, Minus, Plus, Printer } from "lucide-react";
import '../styles/Recipe.css';

const RecipePage: React.FC = () => {
    const location = useLocation();
    const { recipeTitle } = useParams<{ recipeTitle: string }>();
    const recipeFromState = (location.state as { recipe?: Recipe } | null)?.recipe;
    const { recipes, loading } = useRecipes();

    const recipe =
        recipes.find(r => recipeSlug(r.title) === recipeTitle) ??
        (recipeFromState && recipeSlug(recipeFromState.title) === recipeTitle ? recipeFromState : undefined);

    usePageTitle(recipe?.title);

    if (!recipe) {
        return (
            <div className="container">
                {loading ? (
                    <div className="loading"><div className="spinner" /></div>
                ) : (
                    <div className="card empty-state" style={{ marginTop: 48 }}>
                        <h3>Rezept nicht gefunden</h3>
                        <Link to="/cookbook" className="btn">Zum Kochbuch</Link>
                    </div>
                )}
            </div>
        );
    }

    return <RecipeView key={`${recipe.id}-${recipe.defaultPortions}`} recipe={recipe} recipes={recipes} />;
};

/** A recipe with what the visitor has set on its page: the portions, the ticked ingredients and the cook mode. */
const RecipeView: React.FC<{ recipe: Recipe; recipes: Recipe[] }> = ({ recipe, recipes }) => {
    const { folders } = useTravelFolders();
    const { isFavorite, toggleFavorite } = useFavorites();

    const defaultPortions = recipe.defaultPortions ?? 2;
    const [portions, setPortions] = useState<number>(defaultPortions);
    const [checked, setChecked] = useState<Set<number>>(new Set());
    const [cooking, setCooking] = useState(false);
    const [cookStep, setCookStep] = useState(0);

    const toggleChecked = (index: number) =>
        setChecked(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });

    const changePortions = (delta: number) => setPortions(p => Math.min(99, Math.max(1, p + delta)));

    const related = (recipe.relatedRecipeIds ?? [])
        .map(id => recipes.find(r => r.id === id))
        .filter((r): r is Recipe => Boolean(r));

    // links the name of a related recipe inside an ingredient, e.g. "2 EL Basilikum Pesto"
    const renderIngredientWithLinks = (ingredient: string) => {
        for (const relatedRecipe of related) {
            const index = ingredient.indexOf(relatedRecipe.title);
            if (index >= 0) {
                const before = ingredient.slice(0, index);
                const after = ingredient.slice(index + relatedRecipe.title.length);
                return (
                    <>
                        {before}
                        <Link
                            className="ingredient-link"
                            to={recipePath(relatedRecipe)}
                            state={{ recipe: relatedRecipe }}
                            onClick={e => e.stopPropagation()}
                        >
                            {relatedRecipe.title}
                        </Link>
                        {after}
                    </>
                );
            }
        }
        return ingredient;
    };

    const favorite = isFavorite(recipe.id);

    // the trips with the cuisine of the recipe
    const trips = recipeFolders(recipe, folders);

    return (
        <div className="container">
            <Link to="/cookbook" className="back-link" style={{ marginTop: 28 }}>
                <ArrowLeft size={16} />
                Zum Kochbuch
            </Link>

            {/* Kopfbereich */}
            <section className="recipe-hero">
                <a
                    className="recipe-hero-image"
                    href={recipeImage(recipe)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Bild in voller Größe öffnen"
                >
                    <img src={recipeImage(recipe)} alt={recipe.title} />
                </a>

                <div className="recipe-hero-info">
                    {recipe.cuisine && <span className="eyebrow">{recipe.cuisine}e Küche</span>}
                    <h1>{recipe.title}</h1>

                    <div className="recipe-hero-badges">
                        {isVegan(recipe) ? (
                            <span className="badge badge--green"><Leaf size={12} /> vegan</span>
                        ) : isVegetarian(recipe) ? (
                            <span className="badge badge--green"><Leaf size={12} /> vegetarisch</span>
                        ) : null}
                        <span className="badge">{recipe.preparation?.length ?? 0} Schritte</span>
                    </div>

                    <div className="portion-stepper">
                        <span className="portion-stepper-label">Portionen</span>
                        <div className="portion-stepper-controls">
                            <button type="button" onClick={() => changePortions(-1)} disabled={portions <= 1} aria-label="Weniger Portionen">
                                <Minus size={18} />
                            </button>
                            <output aria-live="polite">{portions}</output>
                            <button type="button" onClick={() => changePortions(1)} aria-label="Mehr Portionen">
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="recipe-hero-actions">
                        {recipe.preparation?.length > 0 && (
                            <button type="button" className="btn" onClick={() => setCooking(true)}>
                                <CookingPot size={18} />
                                {cookStep > 0 ? 'Weiterkochen' : 'Kochmodus'}
                            </button>
                        )}
                        <button
                            type="button"
                            className={`btn ${favorite ? '' : 'btn-secondary'}`}
                            onClick={() => toggleFavorite(recipe.id)}
                            aria-pressed={favorite}
                        >
                            <Heart size={18} fill={favorite ? "currentColor" : "none"} />
                            {favorite ? 'In deinen Favoriten' : 'Zu Favoriten'}
                        </button>
                        {/* Browser-Druckdialog; gedruckt wird nur das RecipePrintSheet weiter unten */}
                        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
                            <Printer size={18} />
                            Drucken / PDF
                        </button>
                    </div>
                </div>
            </section>

            {/* Inhalt */}
            <div className="recipe-content">
                <aside className="ingredients card">
                    <h2>Zutaten</h2>
                    <p className="muted ingredients-hint">Antippen zum Abhaken</p>
                    <ul className="ingredients-list">
                        {renderIngredients(recipe, (ingredient, index) => (
                            <li key={index}>
                                <button
                                    type="button"
                                    className={`ingredient-item${checked.has(index) ? ' is-checked' : ''}`}
                                    onClick={() => toggleChecked(index)}
                                    aria-pressed={checked.has(index)}
                                >
                                    <span className="ingredient-check"><Check size={14} /></span>
                                    <span>{renderIngredientWithLinks(adjustIngredient(ingredient, portions, defaultPortions))}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                <section className="preparation">
                    <h2>Zubereitung</h2>
                    <ol className="steps">
                        {recipe.preparation?.map((step, index) => (
                            <li key={index}>
                                <span className="step-number">{index + 1}</span>
                                <p>{renderStepText(step)}</p>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>

            {related.length > 0 && (
                <section className="section">
                    <h2 className="related-title">Passt dazu</h2>
                    <div className="recipe-grid">
                        {related.map(r => <RecipeCard key={r.id} recipe={r} />)}
                    </div>
                </section>
            )}

            {trips.length > 0 && (
                <section className="section">
                    <h2 className="related-title">{trips.length === 1 ? 'Passende Reise' : 'Passende Reisen'}</h2>
                    <div className="other-destinations">
                        {trips.map(trip => <TravelFolderLink key={trip.id} folder={trip} />)}
                    </div>
                </section>
            )}

            {cooking && (
                <CookMode
                    recipe={recipe}
                    portions={portions}
                    step={cookStep}
                    onStepChange={setCookStep}
                    checked={checked}
                    onToggleChecked={toggleChecked}
                    onClose={() => setCooking(false)}
                />
            )}

            <RecipePrintSheet recipe={recipe} portions={portions} />

            <p className="recipe-footer-link">
                <Link to="/cookbook" className="btn btn-secondary">
                    <ArrowLeft size={18} /> Alle Rezepte
                </Link>
            </p>
        </div>
    );
};

export default RecipePage;
