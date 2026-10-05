import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { adjustIngredient, renderIngredients, renderStepText } from "./helper/RecipeHelper";
import { Recipe } from "../types/Recipe";
import { isVegan, isVegetarian, recipeImage } from "../utils/recipe";
import { Leaf } from "lucide-react";

interface RecipePrintSheetProps {
    recipe: Recipe;
    portions: number;
}

const MIN_SCALE = 0.35;
const SCALE_STEP = 0.02;

/**
 * Print view of a recipe: exactly one A4 page that is only visible when printing (styles in Recipe.css).
 * It is laid out off-screen all the time, so its height can be measured and the content shrunk until it
 * fits on that one page.
 */
export default function RecipePrintSheet({ recipe, portions }: RecipePrintSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const fit = () => {
            const sheet = sheetRef.current;
            const content = contentRef.current;
            if (!sheet || !content) return;

            const style = getComputedStyle(sheet);
            const available = sheet.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);

            // a smaller scale also makes the content wider (see .recipe-print-content), so measure again each time
            let scale = 1;
            content.style.setProperty("--print-scale", "1");
            while (content.offsetHeight * scale > available && scale > MIN_SCALE) {
                scale = Math.round((scale - SCALE_STEP) * 100) / 100;
                content.style.setProperty("--print-scale", String(scale));
            }
        };

        fit();
        // the web fonts may arrive later and change the height
        document.fonts.ready.then(fit);
        window.addEventListener("beforeprint", fit);
        return () => window.removeEventListener("beforeprint", fit);
    }, [recipe, portions]);

    const steps = recipe.preparation ?? [];

    return createPortal(
        <div className="recipe-print" ref={sheetRef} aria-hidden="true">
            {/* no page margin: the sheet brings its own, and browsers then leave out their header and footer
                (URL, date, page number). Lives here and not in the CSS file so it only applies to recipes. */}
            <style>{"@page { size: A4; margin: 0; }"}</style>

            <div className="recipe-print-content" ref={contentRef}>
                <header className="recipe-print-head">
                    <img className="recipe-print-image" src={recipeImage(recipe)} alt="" />
                    <div className="recipe-print-info">
                        {recipe.cuisine && <span className="eyebrow">{recipe.cuisine}e Küche</span>}
                        <h1>{recipe.title}</h1>
                        <div className="recipe-hero-badges">
                            {isVegan(recipe) ? (
                                <span className="badge badge--green"><Leaf size={12} /> vegan</span>
                            ) : isVegetarian(recipe) ? (
                                <span className="badge badge--green"><Leaf size={12} /> vegetarisch</span>
                            ) : null}
                            <span className="badge">{portions} {portions === 1 ? "Portion" : "Portionen"}</span>
                            <span className="badge">{steps.length} Schritte</span>
                        </div>
                    </div>
                </header>

                <div className="recipe-print-body">
                    <section className="recipe-print-ingredients card">
                        <h2>Zutaten</h2>
                        <ul className="ingredients-list">
                            {renderIngredients(recipe, (ingredient, index) => (
                                <li key={index} className="recipe-print-ingredient">
                                    <span className="ingredient-check" />
                                    <span>{adjustIngredient(ingredient, portions, recipe.defaultPortions)}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2>Zubereitung</h2>
                        <ol className="steps">
                            {steps.map((step, index) => (
                                <li key={index}>
                                    <span className="step-number">{index + 1}</span>
                                    <p>{renderStepText(step)}</p>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>
            </div>
        </div>,
        document.body
    );
}
