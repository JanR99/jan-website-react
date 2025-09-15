import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../App.css';

export default function Category() {
    const { category } = useParams();
    const [recipes, setRecipes] = useState([]);

    // Fetch recipes based on the category
    useEffect(() => {
        fetch(`/recipes/${category}.json`)
            .then(response => response.json())
            .then(data => setRecipes(data))
            .catch(error => console.error('Error loading recipes:', error));
    }, [category]);

    return (
        <div>
            <header>
                <h1 className="header">{category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category'} Rezepte</h1>
            </header>

            {/* Render recipes */}
            <div className="container">
                {recipes.map((recipe, index) => {
                    // Check if image already has an extension, if not, add '.jpg'
                    const imageSrc = recipe.image.includes('.') ? recipe.image : `${recipe.image}.jpg`;

                    return (
                        <div className="img-cookbook" key={index}>
                            <figcaption>{recipe.title}</figcaption>
                            <Link to={`/cookbook/${category}/${recipe.title.toLowerCase().replace(/\s+/g, '-')}`}>
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
