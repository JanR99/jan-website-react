import React from 'react';
import { Link } from 'react-router-dom';
import TravelController from '../controller/TravelController';
import { useRecipes } from '../hooks/useRecipes';
import { useTravelFolders } from '../hooks/useTravelFolders';
import { recipePath, recipeImage } from '../utils/recipe';
import { TRAVEL_BASE } from '../utils/travel';
import TravelFolderCard from './travel/TravelFolderCard';
import { ArrowRight, BookOpen, Plane } from "lucide-react";
import '../styles/Home.css';

const TEASER_TITLES = ['Char Koay Teow', 'Baozi 包子', 'Falafel Wrap', 'Abura Soba'];
/** The home page only shows a few trips, the travel diary has all of them. */
const TEASER_FOLDERS = 4;

const Home: React.FC = () => {
    const { recipes } = useRecipes();
    const teaser = TEASER_TITLES
        .map(title => recipes.find(r => r.title === title))
        .filter((r): r is NonNullable<typeof r> => Boolean(r));
    const cuisineCount = new Set(recipes.map(r => r.cuisine).filter(Boolean)).size;

    const { folders } = useTravelFolders();
    const covers = folders.flatMap(folder => (folder.coverPhotoId !== null ? [folder.coverPhotoId] : []));

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

                <div className="home-hero-collage" aria-hidden="true">
                    {covers[0] !== undefined && <img src={TravelController.photoUrl(covers[0])} alt="" />}
                    {teaser[0] && <img src={recipeImage(teaser[0])} alt="" />}
                    {covers[1] !== undefined && <img src={TravelController.photoUrl(covers[1])} alt="" />}
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
                <Link to="/cookbook" className="cookbook-teaser card">
                    <div className="cookbook-teaser-text">
                        <span className="eyebrow">Kochbuch</span>
                        <h2>Was koche ich heute?</h2>
                        <p className="muted">
                            {recipes.length > 0
                                ? `${recipes.length} Rezepte aus ${cuisineCount} Küchen – filterbar nach Zutaten, Küche und Ernährung.`
                                : 'Meine Rezeptsammlung – filterbar nach Zutaten, Küche und Ernährung.'}
                        </p>
                        <span className="btn">
                            Rezepte entdecken <ArrowRight size={18} />
                        </span>
                    </div>
                    <div className="cookbook-teaser-images" aria-hidden="true">
                        {teaser.map(recipe => (
                            <img key={recipe.id} src={recipeImage(recipe)} alt="" loading="lazy" />
                        ))}
                    </div>
                </Link>
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
