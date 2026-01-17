import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css';
import '../styles/Category.css';

interface Recipe {
    title: string;
    image: string;
    tags?: string[];
}

// Helper to filter recipes
const filterRecipes = (recipes: Recipe[], filter: string): Recipe[] => {
    if (filter === "alle") return recipes;

    if (filter === "vegetarisch") {
        return recipes.filter(r => r.tags?.includes("vegetarisch") || r.tags?.includes("vegan"));
    }

    if (filter === "vegan") {
        return recipes.filter(r => r.tags?.includes("vegan"));
    }

    return recipes;
};

const Category: React.FC = () => {
    const { category } = useParams<{ category?: string }>();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [filter, setFilter] = useState("alle");

    // Fetch recipes based on the category
    useEffect(() => {
        if (!category) return;

        fetch(`/recipes/${category}.json`)
            .then(response => response.json())
            .then((data: Recipe[]) => setRecipes(data))
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
            <div className="filter-buttons">
                {["alle", "vegetarisch", "vegan"].map(f => (
                    <button
                        key={f}
                        className={`filter-button ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Render recipes */}
            <div className="container">
                {filteredRecipes.map((recipe, index) => {
                    const imageSrc = recipe.image.includes('.') ? recipe.image : `${recipe.image}.jpg`;

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
};

export default Category;
