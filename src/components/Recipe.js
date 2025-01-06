import { useParams } from "react-router-dom";

function Recipe() {
    const { category, recipe } = useParams();

    const recipeDetails = {
        "japanese-curry": {
            title: "Japanese Curry",
            ingredients: ["Rice", "Curry Roux", "Carrots", "Potatoes", "Chicken"],
            steps: ["Cook rice", "Prepare curry roux", "Simmer vegetables and chicken", "Serve with rice"],
        },
        // Add more recipes here
    };

    const details = recipeDetails[recipe] || { title: "Recipe Not Found", ingredients: [], steps: [] };

    return (
        <div>
            <h2>{details.title}</h2>
            <h3>Ingredients</h3>
            <ul>
                {details.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
            <h3>Steps</h3>
            <ol>
                {details.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
            </ol>
        </div>
    );
}

export default Recipe;
