import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { adjustIngredient, renderIngredients, renderStepText } from './helper/RecipeHelper';
import { Recipe } from '../types/Recipe';
import { useRecipes } from '../hooks/useRecipes';
import { useFavorites } from '../hooks/useFavorites';
import { isVegan, isVegetarian, recipeImage, recipeSlug, recipeThumbnail } from '../utils/recipe';
import RecipeCard from './RecipeCard';
import { ArrowLeft, Check, Heart, Leaf, Minus, Plus } from "lucide-react";
import '../styles/Recipe.css';

const RecipePage: React.FC = () => {
    const location = useLocation();
    const { recipeTitle } = useParams<{ recipeTitle: string }>();
    const recipeFromState = (location.state as { recipe?: Recipe } | null)?.recipe;
    const { recipes, loading } = useRecipes();
    const { isFavorite, toggleFavorite } = useFavorites();

    const recipe =
        recipes.find(r => recipeSlug(r.title) === recipeTitle) ??
        (recipeFromState && recipeSlug(recipeFromState.title) === recipeTitle ? recipeFromState : undefined);

    const defaultPortions = recipe?.defaultPortions ?? 2;
    const [portions, setPortions] = useState<number>(defaultPortions);
    const [checked, setChecked] = useState<Set<number>>(new Set());

    // Beim Wechsel auf ein anderes Rezept zurücksetzen
    useEffect(() => {
        setPortions(defaultPortions);
        setChecked(new Set());
    }, [recipeTitle, defaultPortions]);

    useEffect(() => {
        if (recipe) document.title = `${recipe.title} · Jans Website`;
        return () => { document.title = 'Jans Website'; };
    }, [recipe]);

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

    const toggleChecked = (index: number) =>
        setChecked(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });

    const changePortions = (delta: number) => setPortions(p => Math.min(99, Math.max(1, p + delta)));

    const renderIngredientWithLinks = (ingredient: string) => {
        for (const relatedTitle of recipe.relatedRecipes ?? []) {
            if (ingredient.includes(relatedTitle)) {
                const [before, after] = ingredient.split(relatedTitle);
                const related = recipes.find(r => r.title === relatedTitle);
                return (
                    <>
                        {before}
                        <Link
                            className="ingredient-link"
                            to={`/cookbook/${recipeSlug(relatedTitle)}`}
                            state={{ recipe: related }}
                            onClick={e => e.stopPropagation()}
                        >
                            {relatedTitle}
                        </Link>
                        {after}
                    </>
                );
            }
        }
        return ingredient;
    };

    const related = (recipe.relatedRecipes ?? [])
        .map(title => recipes.find(r => r.title === title))
        .filter((r): r is Recipe => Boolean(r));

    const favorite = isFavorite(recipe.title);

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
                    <img src={recipeThumbnail(recipe)} alt={recipe.title} />
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

                    <button
                        type="button"
                        className={`btn ${favorite ? '' : 'btn-secondary'}`}
                        onClick={() => toggleFavorite(recipe.title)}
                        aria-pressed={favorite}
                    >
                        <Heart size={18} fill={favorite ? "currentColor" : "none"} />
                        {favorite ? 'In deinen Favoriten' : 'Zu Favoriten'}
                    </button>
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
                        {related.map(r => <RecipeCard key={r.title} recipe={r} />)}
                    </div>
                </section>
            )}

            <p className="recipe-footer-link">
                <Link to="/cookbook" className="btn btn-secondary">
                    <ArrowLeft size={18} /> Alle Rezepte
                </Link>
            </p>
        </div>
    );
};

export default RecipePage;
