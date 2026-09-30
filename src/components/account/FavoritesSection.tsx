import { Link } from "react-router-dom";
import { useFavorites } from "../../hooks/useFavorites";
import { useRecipes } from "../../hooks/useRecipes";
import RecipeCard from "../RecipeCard";
import { Heart } from "lucide-react";
import "../../styles/Cookbook.css";

export default function FavoritesSection() {
    const { favorites } = useFavorites();
    const { recipes, loading } = useRecipes();
    const favoriteRecipes = recipes.filter((r) => favorites.includes(r.title));

    if (loading) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    if (favoriteRecipes.length === 0) {
        return (
            <div className="card empty-state">
                <span className="empty-state-icon"><Heart size={26} /></span>
                <h3>Noch keine Favoriten</h3>
                <p>Tipp im Kochbuch auf das Herz bei einem Rezept, um es hier zu sammeln.</p>
                <Link to="/cookbook" className="btn">Zum Kochbuch</Link>
            </div>
        );
    }

    return (
        <div className="recipe-grid account-favorites">
            {favoriteRecipes.map((recipe) => (
                <RecipeCard key={recipe.title} recipe={recipe} />
            ))}
        </div>
    );
}
