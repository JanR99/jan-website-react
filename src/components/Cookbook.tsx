import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import '../styles/Cookbook.css';
import { Recipe } from "../types/Recipe";
import Navbar from "./Navbar";

const filterRecipes = (recipes: Recipe[], diet: string, cuisine: string, ingredientSearch: string) => {
    return recipes.filter(r => {
        const matchesDiet =
            diet === "alle" ||
            (diet === "vegan" && r.tags?.includes("vegan")) ||
            (diet === "vegetarisch" && (r.tags?.includes("vegetarisch") || r.tags?.includes("vegan")));

        const matchesCuisine = cuisine === "alle" || r.cuisine === cuisine;

        const matchesIngredientSearch = ingredientSearch
            ? ingredientSearch.toLowerCase().split(',').map(s => s.trim()).every(searchTerm => {
                return r.ingredients?.some(ingredient => {
                    const pattern = new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                    return pattern.test(ingredient);
                });
            })
            : true;

        return matchesDiet && matchesCuisine && matchesIngredientSearch;
    });
};

const Cookbook: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [dietFilter, setDietFilter] = useState("alle");
    const [cuisineFilter, setCuisineFilter] = useState("alle");
    const [ingredientSearch, setIngredientSearch] = useState("");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [showTopButton, setShowTopButton] = useState(false);

    const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>(() => {
        const stored = localStorage.getItem("favoriteRecipes");
        return stored ? JSON.parse(stored) : [];
    });

    const cuisines: string[] = [
        "alle",
        ...Array.from(
            new Set(
                recipes
                    .map(r => r.cuisine)
                    .filter((c): c is string => Boolean(c))
            )
        ).sort((a, b) => a.localeCompare(b))
    ];

    const filteredRecipes = filterRecipes(recipes, dietFilter, cuisineFilter, ingredientSearch)
        .filter(r => !showFavoritesOnly || favoriteRecipes.includes(r.title));

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const data: Recipe[] = await fetch("/recipes/recipes.json").then(res => res.json());

                setRecipes(data);
            } catch (err) {
                console.error("Error loading recipes:", err);
            }
        };

        fetchAll().then();

        const handleScroll = () => {
            setShowTopButton(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleFavorite = (title: string) => {
        setFavoriteRecipes(prev => {
            let updated: string[];
            if (prev.includes(title)) {
                updated = prev.filter(t => t !== title);
            } else {
                updated = [...prev, title];
            }
            localStorage.setItem("favoriteRecipes", JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <div>
            <Navbar
                title="Mein Kochbuch"
                links={[
                    { to: "/", label: "Home" },
                ]}
            />

            <div className="filter-container">
                {/* Diet Filter */}
                <div className="filter-section">
                    <span className="filter-label">Ernährung:</span>
                    <div className="filter-group">
                        {["alle", "vegetarisch", "vegan"].map(f => (
                            <span
                                key={f}
                                className={`filter-pill ${dietFilter === f ? "active" : ""}`}
                                onClick={() => setDietFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Cuisine Filter */}
                <div className="filter-section">
                    <span className="filter-label">Küche:</span>
                    <div className="filter-group">
                        {cuisines.map(c => (
                            <span
                                key={c}
                                className={`filter-pill ${cuisineFilter === c ? "active" : ""}`}
                                onClick={() => setCuisineFilter(c)}
                            >
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Ingredients Search */}
                <div className="filter-section">
                    <span className="filter-label">Zutaten:</span>
                    <input
                        type="text"
                        placeholder="Zutaten eingeben, z.B. 'Tomate, Käse'"
                        value={ingredientSearch}
                        onChange={e => setIngredientSearch(e.target.value)}
                    />
                </div>

                {/* Favorites Section */}
                <div className="filter-section">
                    <span className="filter-label">Favoriten:</span>
                    <div className="filter-group">
                    <span
                        className={`filter-pill ${showFavoritesOnly ? "active" : ""}`}
                        onClick={() => setShowFavoritesOnly(prev => !prev)}
                    >
                        {showFavoritesOnly ? "Nur Favoriten" : "Alle"}
                    </span>
                    </div>
                </div>
            </div>

            {/* Render recipes */}
            <div className="container">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe, index) => {
                        const imageSrc = recipe.image.includes('.') ? recipe.image : `${recipe.image}.jpg`;

                        return (
                            <div className="img-cookbook" key={index}>
                                <figcaption>{recipe.title}</figcaption>
                                <Link
                                    to={`/cookbook/${recipe.title
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")}`}
                                    state={{ recipe }}
                                >
                                    <img
                                        src={`../Bilder/Essen-thumbnail/${imageSrc}`}
                                        alt={recipe.title}
                                    />
                                </Link>
                                <button
                                    className="favorite-button"
                                    onClick={() => toggleFavorite(recipe.title)}
                                >
                                    {favoriteRecipes.includes(recipe.title) ? '★' : '☆'}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <p style={{ textAlign: "center", fontWeight: "bold", marginTop: "20px" }}>
                        Es gibt leider noch keine Rezepte mit diesen Filtern.
                    </p>
                )}
            </div>

            {/* Back to Top Button */}
            {showTopButton && (
                <button
                    onClick={scrollToTop}
                    className="button-link back-to-top"
                    aria-label="Scroll to top"
                >
                    ↑ Top
                </button>
            )}
        </div>
    );
};

export default Cookbook;