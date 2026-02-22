import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import '../styles/Cookbook.css'
import {Recipe} from "../types/Recipe";

// Helper to filter recipes
const filterRecipes = (recipes: Recipe[], diet: string, cuisine: string) => {
    return recipes.filter(r => {
        const matchesDiet =
            diet === "alle" ||
            (diet === "vegan" && r.tags?.includes("vegan")) ||
            (diet === "vegetarisch" &&
                (r.tags?.includes("vegetarisch") || r.tags?.includes("vegan")));

        const matchesCuisine =
            cuisine === "alle" || r.cuisine === cuisine;
        return matchesDiet && matchesCuisine;
    });
};

const Cookbook: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [dietFilter, setDietFilter] = useState("alle");
    const [cuisineFilter, setCuisineFilter] = useState("alle");

    const cuisines: string[] = [
        "alle",
        ...Array.from(
            new Set(recipes.map(r => r.cuisine).filter((c): c is string => Boolean(c)))
        )
    ];
    const filteredRecipes = filterRecipes(recipes, dietFilter, cuisineFilter);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const data: Recipe[] = await fetch("/recipes/recipes.json")
                    .then(res => res.json());

                setRecipes(data);
            } catch (err) {
                console.error("Error loading recipes:", err);
            }
        };

        fetchAll().then();
    }, []);

    return (
        <div>
            <header>
                <h1 className="header">
                    Alle Rezepte
                </h1>
            </header>

            <div className="filter-container">
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
                            </div>
                        );
                    })
                ) : (
                    <p style={{ textAlign: "center", fontWeight: "bold", marginTop: "20px" }}>
                        Es gibt leider noch keine Rezepte mit diesen Filtern.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Cookbook;
