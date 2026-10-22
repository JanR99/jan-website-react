import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { adjustIngredient, renderIngredients } from "./helper/RecipeHelper";
import { Recipe } from "../types/Recipe";

/** The ingredients for the chosen portions, each one ticked off with a tap; section headers stay plain. */
export default function IngredientChecklist({ recipe, portions, checked, onToggle, renderText = (text) => text }: {
    recipe: Recipe;
    portions: number;
    checked: Set<number>;
    onToggle: (index: number) => void;
    /** shows the converted ingredient, e.g. with links in it */
    renderText?: (text: string) => ReactNode;
}) {
    return (
        <ul className="ingredients-list">
            {renderIngredients(recipe, (ingredient, index) => (
                <li key={index}>
                    <button
                        type="button"
                        className={`ingredient-item${checked.has(index) ? " is-checked" : ""}`}
                        onClick={() => onToggle(index)}
                        aria-pressed={checked.has(index)}
                    >
                        <span className="ingredient-check"><Check size={14} /></span>
                        <span>{renderText(adjustIngredient(ingredient, portions, recipe.defaultPortions))}</span>
                    </button>
                </li>
            ))}
        </ul>
    );
}
