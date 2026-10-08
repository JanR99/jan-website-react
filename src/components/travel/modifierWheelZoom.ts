/** Whether a wheel event should zoom the map: only with Ctrl, or Cmd on a Mac. A pinch on a touchpad comes with Ctrl as well. */
export function isZoomWheel(event: Pick<WheelEvent, "ctrlKey" | "metaKey">): boolean {
    return event.ctrlKey || event.metaKey;
}

export function zoomHintText(isMac: boolean): string {
    return isMac ? "⌘ + Mausrad zum Zoomen" : "Strg + Mausrad zum Zoomen";
}

const HINT_DURATION_MS = 1500;

/**
 * Lets the mouse wheel zoom a Leaflet map only while Ctrl (Cmd on a Mac) is held, so the page keeps
 * scrolling over the map; without the key a short hint is shown on the map. The map needs Leaflet's
 * scrollWheelZoom switched on. Returns a function that removes the listener and the hint again.
 */
export function zoomWithModifierWheel(container: HTMLElement): () => void {
    const hint = document.createElement("div");
    hint.className = "map-zoom-hint";
    hint.textContent = zoomHintText(/Mac|iPhone|iPad/.test(navigator.userAgent));
    hint.setAttribute("aria-hidden", "true");
    container.appendChild(hint);
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onWheel = (event: WheelEvent) => {
        if (isZoomWheel(event)) {
            hint.classList.remove("is-visible");
            return;
        }
        // runs before Leaflet's own listener (capture phase): the map ignores the event, the page scrolls as usual
        event.stopImmediatePropagation();
        hint.classList.add("is-visible");
        clearTimeout(timer);
        timer = setTimeout(() => hint.classList.remove("is-visible"), HINT_DURATION_MS);
    };

    container.addEventListener("wheel", onWheel, { capture: true, passive: true });
    return () => {
        clearTimeout(timer);
        container.removeEventListener("wheel", onWheel, { capture: true });
        hint.remove();
    };
}
