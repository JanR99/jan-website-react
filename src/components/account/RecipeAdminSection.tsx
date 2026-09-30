import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { reloadRecipes, useRecipes } from "../../hooks/useRecipes";
import RecipeController from "../../controller/RecipeController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { Recipe } from "../../types/Recipe";
import { recipePath, recipeThumbnail } from "../../utils/recipe";
import Dialog from "../ui/Dialog";
import RecipeEditor from "./RecipeEditor";
import { ExternalLink, Lock, Pencil, Plus, Search, Trash2 } from "lucide-react";

type Mode = { kind: "list" } | { kind: "edit"; recipe: Recipe | null };

export default function RecipeAdminSection() {
    const { permissions } = useAuth();
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

    if (permissions === null || loading) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    if (!permissions.canManageRecipes) {
        return (
            <div className="card empty-state">
                <span className="empty-state-icon"><Lock size={26} /></span>
                <h3>Keine Berechtigung</h3>
                <p>Rezepte können nur von Admins bearbeitet werden.</p>
            </div>
        );
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
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}

            <div className="card recipe-admin-list">
                {filtered.length === 0 ? (
                    <p className="muted recipe-admin-empty">Keine Rezepte gefunden.</p>
                ) : (
                    <ul>
                        {filtered.map((recipe) => (
                            <li key={recipe.id} className="recipe-admin-row">
                                <img src={recipeThumbnail(recipe)} alt="" loading="lazy" />
                                <div className="recipe-admin-row-text">
                                    <strong>{recipe.title}</strong>
                                    <span className="muted">
                                        {[recipe.cuisine, ...recipe.tags].filter(Boolean).join(" · ")}
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
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function close() {
        if (busy) return;
        setError(null);
        onClose();
    }

    async function confirm() {
        if (!recipe) return;
        setBusy(true);
        setError(null);
        try {
            await RecipeController.deleteRecipe(recipe.id);
            await reloadRecipes();
            onDeleted(recipe);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={recipe !== null} onClose={close} labelledBy="delete-recipe-title" className="confirm-dialog">
            <h2 id="delete-recipe-title">Rezept löschen?</h2>
            <p className="muted">
                „{recipe?.title}“ wird dauerhaft gelöscht und aus allen Favoriten und „Passt dazu“-Verweisen entfernt.
            </p>
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
            <div className="profile-form-actions">
                <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>
                    Abbrechen
                </button>
                <button type="button" className="btn btn-danger" onClick={confirm} disabled={busy}>
                    {busy ? "Wird gelöscht …" : "Löschen"}
                </button>
            </div>
        </Dialog>
    );
}
