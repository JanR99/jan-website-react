import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reloadRecipes, useRecipes } from '../hooks/useRecipes';
import { useFavorites } from '../hooks/useFavorites';
import { usePageTitle } from '../hooks/usePageTitle';
import { capitalize } from '../utils/recipe';
import { Diet, filterRecipes } from '../utils/recipeFilter';
import PageHeader from './layout/PageHeader';
import RecipeCard from './RecipeCard';
import BackToTop from './ui/BackToTop';
import LoadError from './ui/LoadError';
import { Heart, Search, Utensils, X } from "lucide-react";
import '../styles/Cookbook.css';

const DIETS: Diet[] = ['alle', 'vegetarisch', 'vegan'];

const Cookbook: React.FC = () => {
    const { recipes, loading, error } = useRecipes();
    const { favorites } = useFavorites();
    usePageTitle('Kochbuch');

    const [params, setParams] = useSearchParams();
    const dietParam = params.get('diet');
    const diet: Diet = DIETS.includes(dietParam as Diet) ? (dietParam as Diet) : 'alle';
    const cuisine = params.get('kueche') ?? 'alle';
    const search = params.get('q') ?? '';
    const favoritesOnly = params.get('favoriten') === '1';

    const updateParam = (key: string, value: string | null) => {
        setParams(prev => {
            const next = new URLSearchParams(prev);
            if (value === null || value === '' || value === 'alle') next.delete(key);
            else next.set(key, value);
            return next;
        }, { replace: true });
    };

    const cuisines = useMemo(
        () => Array.from(new Set(recipes.map(r => r.cuisine).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [recipes]
    );

    const filteredRecipes = useMemo(
        () => filterRecipes(recipes, diet, cuisine, search)
            .filter(r => !favoritesOnly || favorites.includes(r.id)),
        [recipes, diet, cuisine, search, favoritesOnly, favorites]
    );

    const hasFilters = diet !== 'alle' || cuisine !== 'alle' || search !== '' || favoritesOnly;

    return (
        <div className="container">
            <PageHeader
                eyebrow="Kochbuch"
                title="Mein Kochbuch"
                lead={recipes.length > 0
                    ? `${recipes.length} Rezepte aus ${cuisines.length} Küchen. Such nach dem, was noch im Kühlschrank ist.`
                    : 'Meine gesammelten Lieblingsrezepte.'}
            />

            {/* Filter */}
            <div className="filter-panel card">
                <div className="input-with-icon filter-search">
                    <Search size={18} />
                    <input
                        className="input"
                        type="search"
                        placeholder="Rezept oder Zutaten, z.B. „Tomate, Käse“"
                        value={search}
                        onChange={e => updateParam('q', e.target.value)}
                        aria-label="Rezepte durchsuchen"
                    />
                </div>

                <div className="filter-row">
                    <div className="segmented" role="group" aria-label="Ernährung">
                        {DIETS.map(d => (
                            <button
                                key={d}
                                type="button"
                                aria-pressed={diet === d}
                                onClick={() => updateParam('diet', d)}
                            >
                                {d === 'alle' ? 'Alles' : capitalize(d)}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="chip chip-favorites"
                        aria-pressed={favoritesOnly}
                        onClick={() => updateParam('favoriten', favoritesOnly ? null : '1')}
                    >
                        <Heart size={16} fill={favoritesOnly ? "currentColor" : "none"} />
                        Favoriten{favorites.length > 0 && ` (${favorites.length})`}
                    </button>
                </div>

                <div className="filter-cuisines" role="group" aria-label="Küche">
                    {['alle', ...cuisines].map(c => (
                        <button
                            key={c}
                            type="button"
                            className="chip"
                            aria-pressed={cuisine === c}
                            onClick={() => updateParam('kueche', c)}
                        >
                            {c === 'alle' ? 'Alle Küchen' : capitalize(c)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ergebnis */}
            <div className="results-bar">
                <span className="muted">
                    {error ? '' : loading ? 'Rezepte werden geladen …' : `${filteredRecipes.length} ${filteredRecipes.length === 1 ? 'Rezept' : 'Rezepte'}`}
                </span>
                {hasFilters && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setParams({}, { replace: true })}>
                        <X size={16} /> Filter zurücksetzen
                    </button>
                )}
            </div>

            {error ? (
                <LoadError message={error} onRetry={() => void reloadRecipes()} />
            ) : loading ? (
                <div className="recipe-grid">
                    {Array.from({ length: 6 }, (_, i) => <div key={i} className="recipe-card-skeleton skeleton" />)}
                </div>
            ) : filteredRecipes.length > 0 ? (
                <div className="recipe-grid">
                    {filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
                </div>
            ) : (
                <div className="card empty-state">
                    <span className="empty-state-icon"><Utensils size={26} /></span>
                    <h3>Keine passenden Rezepte</h3>
                    <p>
                        {favoritesOnly && favorites.length === 0
                            ? 'Du hast noch keine Favoriten. Tipp aufs Herz bei einem Rezept, um es zu merken.'
                            : 'Es gibt leider noch keine Rezepte mit diesen Filtern.'}
                    </p>
                    <button type="button" className="btn btn-secondary" onClick={() => setParams({}, { replace: true })}>
                        Filter zurücksetzen
                    </button>
                </div>
            )}

            <BackToTop />
        </div>
    );
};

export default Cookbook;
