import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import RecipeController from "../../controller/RecipeController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { reloadRecipes } from "../../hooks/useRecipes";
import { Recipe, RecipeRequest, RECIPE_TAGS, RecipeTag } from "../../types/Recipe";
import { recipeImage } from "../../utils/recipe";
import RecipeImageDropzone from "./RecipeImageDropzone";
import { ArrowLeft, X } from "lucide-react";

interface RecipeEditorProps {
    recipe: Recipe | null;
    allRecipes: Recipe[];
    onCancel: () => void;
    onSaved: (recipe: Recipe) => void;
}

const toLines = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean);
const ALL_TAGS = Object.keys(RECIPE_TAGS) as RecipeTag[];

export default function RecipeEditor({ recipe, allRecipes, onCancel, onSaved }: RecipeEditorProps) {
    const [title, setTitle] = useState(recipe?.title ?? "");
    const [image, setImage] = useState(recipe?.image ?? "");
    const [portions, setPortions] = useState(String(recipe?.defaultPortions ?? 2));
    const [cuisine, setCuisine] = useState(recipe?.cuisine ?? "");
    const [tags, setTags] = useState<RecipeTag[]>(recipe?.tags ?? []);
    const [ingredients, setIngredients] = useState((recipe?.ingredients ?? []).join("\n"));
    const [preparation, setPreparation] = useState((recipe?.preparation ?? []).join("\n"));
    const [related, setRelated] = useState<number[]>(recipe?.relatedRecipeIds ?? []);
    const [previewUrl, setPreviewUrl] = useState<string | null>(recipe ? recipeImage(recipe) : null);
    const [uploading, setUploading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cuisines = useMemo(
        () => Array.from(new Set(allRecipes.map((r) => r.cuisine).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [allRecipes]
    );
    const byId = useMemo(() => new Map(allRecipes.map((r) => [r.id, r])), [allRecipes]);
    const selectable = allRecipes.filter((r) => r.id !== recipe?.id && !related.includes(r.id));

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        const request: RecipeRequest = {
            title: title.trim(),
            image: image.trim(),
            defaultPortions: Number(portions),
            cuisine: cuisine.trim(),
            tags: ALL_TAGS.filter((tag) => tags.includes(tag)),
            ingredients: toLines(ingredients),
            preparation: toLines(preparation),
            relatedRecipeIds: related,
        };

        if (!request.title || !request.cuisine) {
            setError("Titel und Küche dürfen nicht leer sein.");
            return;
        }
        if (!request.image) {
            setError("Bitte ein Bild hochladen.");
            return;
        }
        if (!Number.isInteger(request.defaultPortions) || request.defaultPortions < 1 || request.defaultPortions > 99) {
            setError("Portionen müssen zwischen 1 und 99 liegen.");
            return;
        }
        if (request.ingredients.length === 0 || request.preparation.length === 0) {
            setError("Zutaten und Zubereitung brauchen mindestens eine Zeile.");
            return;
        }

        setBusy(true);
        try {
            const saved = recipe
                ? await RecipeController.updateRecipe(recipe.id, request)
                : await RecipeController.createRecipe(request);
            await reloadRecipes();
            onSaved(saved);
        } catch (err) {
            setError(handleApiError(err));
            setBusy(false);
        }
    }

    return (
        <form className="card card-pad recipe-editor" onSubmit={handleSubmit}>
            <div className="account-card-head">
                <h2 className="account-card-title">{recipe ? `„${recipe.title}“ bearbeiten` : "Neues Rezept"}</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={busy}>
                    <ArrowLeft size={16} />
                    Zur Liste
                </button>
            </div>

            <label className="field">
                Titel
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required />
            </label>

            <RecipeImageDropzone
                previewUrl={previewUrl}
                onBusyChange={setUploading}
                onUploaded={(name) => {
                    setImage(name);
                    setPreviewUrl(recipeImage({ image: name }));
                }}
            />

            <div className="recipe-editor-row">
                <label className="field">
                    Portionen
                    <input
                        className="input"
                        type="number"
                        min={1}
                        max={99}
                        value={portions}
                        onChange={(e) => setPortions(e.target.value)}
                        required
                    />
                </label>
                <label className="field">
                    Küche
                    <input
                        className="input"
                        list="recipe-editor-cuisines"
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                        placeholder="z. B. italienisch"
                        required
                    />
                    <datalist id="recipe-editor-cuisines">
                        {cuisines.map((c) => <option key={c} value={c} />)}
                    </datalist>
                </label>
                <div className="field">
                    Tags
                    <div className="recipe-editor-tags" role="group" aria-label="Tags">
                        {ALL_TAGS.map((tag) => {
                            const active = tags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    className="chip"
                                    aria-pressed={active}
                                    onClick={() =>
                                        setTags((prev) => (active ? prev.filter((t) => t !== tag) : [...prev, tag]))
                                    }
                                >
                                    {RECIPE_TAGS[tag]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <label className="field">
                Zutaten
                <textarea
                    className="input recipe-editor-textarea"
                    rows={10}
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    required
                />
                <span className="muted recipe-editor-hint">
                    Eine Zutat pro Zeile, Menge vorne (z. B. „200 g Mehl“), damit sie mit den Portionen umgerechnet wird.
                    Zeilen mit „:“ am Ende werden zu Zwischenüberschriften.
                </span>
            </label>

            <label className="field">
                Zubereitung
                <textarea
                    className="input recipe-editor-textarea"
                    rows={10}
                    value={preparation}
                    onChange={(e) => setPreparation(e.target.value)}
                    required
                />
                <span className="muted recipe-editor-hint">Ein Schritt pro Zeile.</span>
            </label>

            <div className="field">
                Passt dazu
                {related.length > 0 && (
                    <ul className="recipe-editor-related">
                        {related.map((id) => (
                            <li key={id} className="chip">
                                {byId.get(id)?.title ?? `Rezept ${id}`}
                                <button
                                    type="button"
                                    onClick={() => setRelated((prev) => prev.filter((r) => r !== id))}
                                    aria-label={`${byId.get(id)?.title ?? "Rezept"} entfernen`}
                                >
                                    <X size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <select
                    className="input"
                    value=""
                    onChange={(e) => {
                        const id = Number(e.target.value);
                        if (id) setRelated((prev) => [...prev, id]);
                    }}
                    aria-label="Passendes Rezept hinzufügen"
                >
                    <option value="">Rezept hinzufügen …</option>
                    {selectable.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
                <span className="muted recipe-editor-hint">
                    Kommt der Titel eines dieser Rezepte in einer Zutat vor, wird er dort verlinkt.
                </span>
            </div>

            {error && <p className="form-message form-message--error" role="alert">{error}</p>}

            <div className="profile-form-actions">
                <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
                    Abbrechen
                </button>
                <button type="submit" className="btn" disabled={busy || uploading}>
                    {busy ? "Speichern …" : uploading ? "Bild wird hochgeladen …" : recipe ? "Änderungen speichern" : "Rezept anlegen"}
                </button>
            </div>
        </form>
    );
}
