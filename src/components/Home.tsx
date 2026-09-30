import React from 'react';
import { Link } from 'react-router-dom';
import { destinations, destinationThumbnail } from '../data/destinations';
import { useRecipes } from '../hooks/useRecipes';
import { recipePath, recipeThumbnail } from '../utils/recipe';
import { ArrowRight, BookOpen, Plane } from "lucide-react";
import '../styles/Home.css';

const TEASER_IMAGES = ['CharKoayTeow.jpg', 'Baozi.jpg', 'FalafelWrap.jpg', 'AburaSoba.jpg'];

const Home: React.FC = () => {
    const { recipes } = useRecipes();
    const teaser = TEASER_IMAGES
        .map(image => recipes.find(r => r.image === image))
        .filter((r): r is NonNullable<typeof r> => Boolean(r));
    const cuisineCount = new Set(recipes.map(r => r.cuisine).filter(Boolean)).size;

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
                        <a href="#reisen" className="btn btn-secondary">
                            <Plane size={18} />
                            Reisen ansehen
                        </a>
                    </div>
                </div>

                <div className="home-hero-collage" aria-hidden="true">
                    <img src={destinationThumbnail('Porto', 1)} alt="" />
                    {teaser[0] && <img src={recipeThumbnail(teaser[0])} alt="" />}
                    <img src={destinationThumbnail('Andorra', 1)} alt="" />
                </div>
            </section>

            {/* Reisen */}
            <section className="section" id="reisen">
                <div className="section-head">
                    <div>
                        <span className="eyebrow">Unterwegs</span>
                        <h2>Meine Reisen</h2>
                    </div>
                </div>

                <div className="destination-grid">
                    {destinations.map(dest => (
                        <Link key={dest.name} to={`/destination/${dest.name}`} className="destination-card">
                            <img
                                src={destinationThumbnail(dest.name, 1)}
                                alt={dest.name}
                                loading="lazy"
                            />
                            <div className="destination-card-body">
                                {dest.country !== dest.name && (
                                    <span className="destination-card-country">{dest.country}</span>
                                )}
                                <h3>{dest.name}</h3>
                                <span className="destination-card-cta">
                                    {dest.imageCount} Fotos <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

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
                            <img key={recipe.title} src={recipeThumbnail(recipe)} alt="" loading="lazy" />
                        ))}
                    </div>
                </Link>
                {teaser.length > 0 && (
                    <p className="cookbook-teaser-links muted">
                        Zum Beispiel:{' '}
                        {teaser.map((recipe, i) => (
                            <React.Fragment key={recipe.title}>
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
