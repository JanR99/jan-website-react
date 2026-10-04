import { useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { createPortal } from "react-dom";
import { adjustIngredient, renderIngredients, renderStepText } from "./helper/RecipeHelper";
import { Recipe } from "../types/Recipe";
import { useWakeLock } from "../hooks/useWakeLock";
import { ArrowLeft, ArrowRight, Check, ListChecks, SunMedium, X } from "lucide-react";

interface CookModeProps {
    recipe: Recipe;
    portions: number;
    /** index of the current step, kept by the recipe page so reopening continues there */
    step: number;
    onStepChange: (step: number) => void;
    checked: Set<number>;
    onToggleChecked: (index: number) => void;
    onClose: () => void;
}

const SWIPE_DISTANCE = 60;

export default function CookMode({ recipe, portions, step, onStepChange, checked, onToggleChecked, onClose }: CookModeProps) {
    const steps = recipe.preparation ?? [];
    const lastStep = Math.max(0, steps.length - 1);
    const current = Math.min(step, lastStep);

    const [showIngredients, setShowIngredients] = useState(false);
    const wakeLock = useWakeLock(true);
    const nextRef = useRef<HTMLButtonElement>(null);
    const touchStart = useRef<{ x: number; y: number } | null>(null);

    const go = (delta: number) => onStepChange(Math.min(lastStep, Math.max(0, current + delta)));

    // Keyboard: arrows change the step, Escape closes the ingredients first, then the cook mode
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (showIngredients) setShowIngredients(false);
                else onClose();
            } else if (event.key === "ArrowRight") {
                onStepChange(Math.min(lastStep, current + 1));
            } else if (event.key === "ArrowLeft") {
                onStepChange(Math.max(0, current - 1));
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [current, lastStep, showIngredients, onClose, onStepChange]);

    // No scrolling of the page behind the overlay, focus back to where it was on close
    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        nextRef.current?.focus();
        return () => {
            document.body.style.overflow = overflow;
            previouslyFocused?.focus?.();
        };
    }, []);

    function handleTouchStart(event: TouchEvent) {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
    }

    function handleTouchEnd(event: TouchEvent) {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start || showIngredients) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        // clearly horizontal, so scrolling a long step doesn't change it
        if (Math.abs(dx) >= SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) {
            go(dx < 0 ? 1 : -1);
        }
    }

    const isLast = current === lastStep;

    return createPortal(
        <div className="cook-mode" role="dialog" aria-modal="true" aria-label={`Kochmodus: ${recipe.title}`}>
            <header className="cook-mode-header">
                <div className="cook-mode-title">
                    <strong>{recipe.title}</strong>
                    <span className="muted">
                        {wakeLock === "active" && <><SunMedium size={14} /> Bildschirm bleibt an</>}
                        {wakeLock === "unsupported" && "Dein Browser kann den Bildschirm nicht anlassen"}
                        {wakeLock === "failed" && "Der Bildschirm konnte nicht angelassen werden"}
                    </span>
                </div>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowIngredients(v => !v)}
                    aria-expanded={showIngredients}
                    aria-controls="cook-mode-ingredients"
                >
                    <ListChecks size={16} />
                    Zutaten
                </button>
                <button type="button" className="icon-btn" onClick={onClose} aria-label="Kochmodus schließen">
                    <X size={22} />
                </button>
            </header>

            <div
                className="cook-mode-progress"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={steps.length}
                aria-valuenow={current + 1}
                aria-label="Fortschritt"
            >
                <span style={{ width: `${((current + 1) / Math.max(1, steps.length)) * 100}%` }} />
            </div>

            <main className="cook-mode-body" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <p className="cook-mode-count" aria-live="polite">Schritt {current + 1} von {steps.length}</p>
                <p className="cook-mode-step" key={current}>{renderStepText(steps[current] ?? "")}</p>
            </main>

            <footer className="cook-mode-footer">
                <button type="button" className="btn btn-secondary cook-mode-nav" onClick={() => go(-1)} disabled={current === 0}>
                    <ArrowLeft size={20} />
                    Zurück
                </button>
                <button
                    type="button"
                    className="btn cook-mode-nav"
                    ref={nextRef}
                    onClick={() => (isLast ? onClose() : go(1))}
                >
                    {isLast ? <>Fertig <Check size={20} /></> : <>Weiter <ArrowRight size={20} /></>}
                </button>
            </footer>

            {showIngredients && (
                <>
                    <div className="cook-mode-backdrop" onClick={() => setShowIngredients(false)} />
                    <aside className="cook-mode-ingredients" id="cook-mode-ingredients" aria-label="Zutaten">
                        <div className="cook-mode-ingredients-head">
                            <h2>Zutaten</h2>
                            <span className="muted">für {portions} {portions === 1 ? "Portion" : "Portionen"}</span>
                            <button type="button" className="icon-btn" onClick={() => setShowIngredients(false)} aria-label="Zutaten schließen">
                                <X size={20} />
                            </button>
                        </div>
                        <ul className="ingredients-list">
                            {renderIngredients(recipe, (ingredient, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        className={`ingredient-item${checked.has(index) ? " is-checked" : ""}`}
                                        onClick={() => onToggleChecked(index)}
                                        aria-pressed={checked.has(index)}
                                    >
                                        <span className="ingredient-check"><Check size={14} /></span>
                                        <span>{adjustIngredient(ingredient, portions, recipe.defaultPortions)}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </>
            )}
        </div>,
        document.body
    );
}
