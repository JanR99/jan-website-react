import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TravelController from '../controller/TravelController';
import { reloadRecipes, useRecipes } from '../hooks/useRecipes';
import { reloadTravelFolders, useTravelFolders } from '../hooks/useTravelFolders';
import { chosenByChance } from '../utils/chance';
import { randomRecipe, recipePath, recipeImage } from '../utils/recipe';
import { collagePhotos, TRAVEL_BASE, travelFolderPath } from '../utils/travel';
import TravelFolderCard from './travel/TravelFolderCard';
import { ArrowRight, BookOpen, Dices, Plane } from "lucide-react";
import '../styles/Home.css';

/** The cookbook teaser shows a few recipes chosen by chance, the collage at the top a few travel photos. */
const TEASER_RECIPES = 4;
const COLLAGE_PHOTOS = 2;
/** drawn once per visit, so the choice stays while the page is open, also when coming back to the home page */
const VISIT_SEED = Math.random();
/** The home page only shows a few trips, the travel diary has all of them. */
const TEASER_FOLDERS = 4;
/** last random recipe, so it does not suggest the same recipe twice in a row. */
let lastSurpriseId: number | undefined;

const Home: React.FC = () => {
    const { recipes, loading: recipesLoading, error: recipesError } = useRecipes();
    const teaser = chosenByChance(recipes, TEASER_RECIPES, VISIT_SEED);
    const cuisineCount = new Set(recipes.map(r => r.cuisine).filter(Boolean)).size;

    const { folders, error: foldersError } = useTravelFolders();
    const collage = collagePhotos(folders, COLLAGE_PHOTOS, VISIT_SEED);

    // the trips are missing as well when the backend can't be reached, so one try gets both
    const retry = () => {
        void reloadRecipes();
        if (foldersError) void reloadTravelFolders();
    };

    const navigate = useNavigate();
    const openRandomRecipe = () => {
        const recipe = randomRecipe(recipes, lastSurpriseId);
        if (!recipe) return;
        lastSurpriseId = recipe.id;
        navigate(recipePath(recipe), { state: { recipe } });
    };

    return (
        <div className="container">
            {/* Hero */}
            <section className="home-hero">
                <div className="home-hero-text">
                    <span className="eyebrow">Reisen &amp; Kochen</span>
                    <h1>Willkommen auf meiner Website</h1>
                    <p className="page-header-lead">
                        Hier sammle ich Eindrücke von meinen Reisen und meine liebsten Rezepte –
                        von japanischem Curry bis zum Bananenbrot.
                    </p>
                    <div className="home-hero-actions">
                        <Link to="/cookbook" className="btn">
                            <BookOpen size={18} />
                            Zum Kochbuch
                        </Link>
                        <Link to={TRAVEL_BASE} className="btn btn-secondary">
                            <Plane size={18} />
                            Zum Reisetagebuch
                        </Link>
                    </div>
                </div>

                {/* each picture leads to its trip or recipe */}
                <div className="home-hero-collage">
                    {collage[0] && (
                        <Link to={travelFolderPath(collage[0].folder)} aria-label={collage[0].folder.name} title={collage[0].folder.name}>
                            <img src={TravelController.photoUrl(collage[0].photo.id)} alt="" />
                        </Link>
                    )}
                    {teaser[0] && (
                        <Link to={recipePath(teaser[0])} state={{ recipe: teaser[0] }} aria-label={teaser[0].title} title={teaser[0].title}>
                            <img src={recipeImage(teaser[0])} alt="" />
                        </Link>
                    )}
                    {collage[1] && (
                        <Link to={travelFolderPath(collage[1].folder)} aria-label={collage[1].folder.name} title={collage[1].folder.name}>
                            <img src={TravelController.photoUrl(collage[1].photo.id)} alt="" />
                        </Link>
                    )}
                </div>
            </section>

            {/* Reisen-Teaser */}
            {folders.length > 0 && (
                <section className="section">
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">Unterwegs</span>
                            <h2>Meine Reisen</h2>
                        </div>
                        <Link to={TRAVEL_BASE} className="btn btn-secondary btn-sm">
                            Alle Reisen <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="destination-grid">
                        {folders.slice(0, TEASER_FOLDERS).map(folder => (
                            <TravelFolderCard key={folder.id} folder={folder} />
                        ))}
                    </div>
                </section>
            )}

            {/* Kochbuch-Teaser */}
            <section className="section">
                <div className="cookbook-teaser card">
                    {/* makes the whole card lead to the cookbook; the buttons below lie on top of it */}
                    <Link to="/cookbook" className="cookbook-teaser-cover" aria-hidden="true" tabIndex={-1} />
                    <div className="cookbook-teaser-text">
                        <span className="eyebrow">Kochbuch</span>
                        <h2>Was koche ich heute?</h2>
                        {recipes.length === 0 && recipesError ? (
                            <p className="muted cookbook-teaser-error" role="alert">
                                Die Rezepte konnten gerade nicht geladen werden.
                                <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
                                    Erneut versuchen
                                </button>
                            </p>
                        ) : (
                            <p className="muted">
                                {recipes.length > 0
                                    ? `${recipes.length} Rezepte aus ${cuisineCount} Küchen – filterbar nach Zutaten, Küche und Ernährung.`
                                    : recipesLoading
                                        ? 'Rezepte werden geladen …'
                                        : 'Meine Rezeptsammlung – filterbar nach Zutaten, Küche und Ernährung.'}
                            </p>
                        )}
                        <div className="cookbook-teaser-actions">
                            <Link to="/cookbook" className="btn">
                                Rezepte entdecken <ArrowRight size={18} />
                            </Link>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={openRandomRecipe}
                                disabled={recipes.length === 0}
                            >
                                <Dices size={18} />
                                Überrasch mich
                            </button>
                        </div>
                    </div>
                    {/* each picture leads to its recipe; for keyboards and screen readers the links below the card do that */}
                    <div className="cookbook-teaser-images" aria-hidden="true">
                        {teaser.map(recipe => (
                            <Link key={recipe.id} to={recipePath(recipe)} state={{ recipe }} tabIndex={-1} title={recipe.title}>
                                <img src={recipeImage(recipe)} alt="" loading="lazy" />
                            </Link>
                        ))}
                    </div>
                </div>
                {teaser.length > 0 && (
                    <p className="cookbook-teaser-links muted">
                        Zum Beispiel:{' '}
                        {teaser.map((recipe, i) => (
                            <React.Fragment key={recipe.id}>
                                {i > 0 && ' · '}
                                <Link to={recipePath(recipe)} state={{ recipe }}>{recipe.title}</Link>
                            </React.Fragment>
                        ))}
                    </p>
                )}
            </section>
        </div>
    );
};

export default Home;
