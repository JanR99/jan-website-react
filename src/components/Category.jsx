import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css';

// Helper to filter recipes
const filterRecipes = (recipes, filter) => {
    if (filter === "alle") return recipes;

    if (filter === "vegetarisch") {
        return recipes.filter(r => r.tags?.includes("vegetarisch") || r.tags?.includes("vegan"));
    }

    if (filter === "vegan") {
        return recipes.filter(r => r.tags?.includes("vegan"));
    }

    return recipes;
};

export default function Category() {
    const { category } = useParams();
    const [recipes, setRecipes] = useState([]);
    const [filter, setFilter] = useState("alle");

    // Fetch recipes based on the category
    useEffect(() => {
        fetch(`/recipes/${category}.json`)
            .then(response => response.json())
            .then(data => setRecipes(data))
            .catch(error => console.error('Error loading recipes:', error));
    }, [category]);

    const filteredRecipes = filterRecipes(recipes, filter);

    return (
        <div>
            <header>
                <h1 className="header">
                    {category
                        ? category.charAt(0).toUpperCase() + category.slice(1)
                        : "Category"}{" "}
                    Rezepte
                </h1>
            </header>

            {/* Filter Buttons */}
            <div className="top">
                <button
                    className={`button-link ${filter === "alle" ? "active" : ""}`}
                    onClick={() => setFilter("alle")}
                >
                    Alle
                </button>
                <button
                    className={`button-link ${filter === "vegetarisch" ? "active" : ""}`}
                    onClick={() => setFilter("vegetarisch")}
                >
                    Vegetarisch
                </button>
                <button
                    className={`button-link ${filter === "vegan" ? "active" : ""}`}
                    onClick={() => setFilter("vegan")}
                >
                    Vegan
                </button>
            </div>

            {/* Render recipes */}
            <div className="container">
                {filteredRecipes.map((recipe, index) => {
                    // Check if image already has an extension, if not, add '.jpg'
                    const imageSrc = recipe.image.includes('.')
                        ? recipe.image
                        : `${recipe.image}.jpg`;

                    return (
                        <div className="img-cookbook" key={index}>
                            <figcaption>{recipe.title}</figcaption>
                            <Link
                                to={`/cookbook/${category}/${recipe.title
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`}
                            >
                                <img
                                    src={`../Bilder/Essen-thumbnail/${imageSrc}`}
                                    alt={recipe.title}
                                />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
