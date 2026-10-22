import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PermissionGate from "./PermissionGate";
import { reloadRecipes, useRecipes } from "../../hooks/useRecipes";
import RecipeController from "../../controller/RecipeController";
import { Recipe, RECIPE_TAGS } from "../../types/Recipe";
import { recipePath, recipeImage } from "../../utils/recipe";
import ConfirmDeleteDialog from "../ui/ConfirmDeleteDialog";
import FormError from "../ui/FormError";
import RecipeEditor from "./RecipeEditor";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Spinner from "../ui/Spinner";

type Mode = { kind: "list" } | { kind: "edit"; recipe: Recipe | null };

export default function RecipeAdminSection() {
    return <PermissionGate permission="MANAGE_RECIPES"><RecipeAdmin /></PermissionGate>;
}

function RecipeAdmin() {
    const { recipes, loading, error } = useRecipes();
    const [mode, setMode] = useState<Mode>({ kind: "list" });
    const [search, setSearch] = useState("");
    const [notice, setNotice] = useState<string | null>(null);
    const [toDelete, setToDelete] = useState<Recipe | null>(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return term
            ? recipes.filter((r) => r.title.toLowerCase().includes(term) || r.cuisine.toLowerCase().includes(term))
            : recipes;
    }, [recipes, search]);

    if (loading) {
        return <Spinner />;
    }

    function openEditor(recipe: Recipe | null) {
        setNotice(null);
        setMode({ kind: "edit", recipe });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (mode.kind === "edit") {
        return (
            <RecipeEditor
                recipe={mode.recipe}
                allRecipes={recipes}
                onCancel={() => setMode({ kind: "list" })}
                onSaved={(saved) => {
                    setMode({ kind: "list" });
                    setNotice(`„${saved.title}“ wurde gespeichert.`);
                }}
            />
        );
    }

    return (
        <div className="account-stack">
            <div className="recipe-admin-toolbar">
                <label className="input-with-icon recipe-admin-search">
                    <Search size={18} />
                    <input
                        className="input"
                        type="search"
                        placeholder="Rezept suchen …"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Rezept suchen"
                    />
                </label>
                <button type="button" className="btn" onClick={() => openEditor(null)}>
                    <Plus size={18} />
                    Neues Rezept
                </button>
            </div>

            {notice && <p className="form-message form-message--success" role="status">{notice}</p>}
            <FormError message={error} />

            <div className="card recipe-admin-list">
                {filtered.length === 0 ? (
                    <p className="muted recipe-admin-empty">Keine Rezepte gefunden.</p>
                ) : (
                    <ul>
                        {filtered.map((recipe) => (
                            <li key={recipe.id} className="recipe-admin-row">
                                <img src={recipeImage(recipe)} alt="" loading="lazy" />
                                <div className="recipe-admin-row-text">
                                    <strong>{recipe.title}</strong>
                                    <span className="muted">
                                        {[recipe.cuisine, ...recipe.tags.map((tag) => RECIPE_TAGS[tag])].filter(Boolean).join(" · ")}
                                    </span>
                                </div>
                                <div className="recipe-admin-row-actions">
                                    <Link
                                        to={recipePath(recipe)}
                                        className="icon-btn"
                                        aria-label={`${recipe.title} ansehen`}
                                        title="Ansehen"
                                    >
                                        <ExternalLink size={18} />
                                    </Link>
                                    <button
                                        type="button"
                                        className="icon-btn"
                                        onClick={() => openEditor(recipe)}
                                        aria-label={`${recipe.title} bearbeiten`}
                                        title="Bearbeiten"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        className="icon-btn recipe-admin-delete"
                                        onClick={() => setToDelete(recipe)}
                                        aria-label={`${recipe.title} löschen`}
                                        title="Löschen"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <DeleteRecipeDialog
                recipe={toDelete}
                onClose={() => setToDelete(null)}
                onDeleted={(deleted) => {
                    setToDelete(null);
                    setNotice(`„${deleted.title}“ wurde gelöscht.`);
                }}
            />
        </div>
    );
}

function DeleteRecipeDialog({ recipe, onClose, onDeleted }: {
    recipe: Recipe | null;
    onClose: () => void;
    onDeleted: (recipe: Recipe) => void;
}) {
    async function confirm() {
        if (!recipe) return;
        await RecipeController.deleteRecipe(recipe.id);
        await reloadRecipes();
        onDeleted(recipe);
    }

    return (
        <ConfirmDeleteDialog open={recipe !== null} title="Rezept löschen?" onClose={onClose} onConfirm={confirm}>
            <p className="muted">
                „{recipe?.title}“ wird dauerhaft gelöscht und aus allen Favoriten und „Passt dazu“-Verweisen entfernt.
            </p>
        </ConfirmDeleteDialog>
    );
}
