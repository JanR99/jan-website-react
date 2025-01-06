import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Kartoffel() {
    const [recipes, setRecipes] = useState([]);

    // Fetch recipes from the JSON file
    useEffect(() => {
        fetch('/recipes/kartoffel.json')
            .then(response => response.json())
            .then(data => setRecipes(data))
            .catch(error => console.error('Error loading recipes:', error));
    }, []);

    return (
        <div>
            <header>
                <h1 className="header">Kartoffel Rezepte</h1>
            </header>

            {/* Render recipes */}
            <div className="container">
                {recipes.map((recipe, index) => {
                    // Check if image already has an extension, if not, add '.jpg'
                    const imageSrc = recipe.image.includes('.') ? recipe.image : `${recipe.image}.jpg`;

                    return (
                        <div className="img-cookbook" key={index}>
                            <figcaption>{recipe.title}</figcaption>
                            <Link to={`/recipe/${recipe.title.toLowerCase().replace(/\s+/g, '-')}`}>
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

export default Kartoffel;
