import { afterEach, describe, expect, it, vi } from "vitest";
import { isZoomWheel, zoomHintText, zoomWithModifierWheel } from "./modifierWheelZoom";

describe("isZoomWheel", () => {
    it("zooms only with Ctrl or Cmd", () => {
        expect(isZoomWheel({ ctrlKey: false, metaKey: false })).toBe(false);
        expect(isZoomWheel({ ctrlKey: true, metaKey: false })).toBe(true);
        expect(isZoomWheel({ ctrlKey: false, metaKey: true })).toBe(true);
    });
});

describe("zoomHintText", () => {
    it("names the key of the system", () => {
        expect(zoomHintText(false)).toBe("Strg + Mausrad zum Zoomen");
        expect(zoomHintText(true)).toBe("⌘ + Mausrad zum Zoomen");
    });
});

describe("zoomWithModifierWheel", () => {
    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = "";
    });

    /** A map container with a tile in it; the spy stands for Leaflet's own wheel listener. */
    function setUp() {
        const container = document.createElement("div");
        const tile = document.createElement("img");
        container.appendChild(tile);
        document.body.appendChild(container);
        const leaflet = vi.fn();
        container.addEventListener("wheel", leaflet);
        const remove = zoomWithModifierWheel(container);
        const hint = container.querySelector(".map-zoom-hint")!;
        return { container, tile, leaflet, remove, hint };
    }

    it("keeps a plain wheel away from the map and shows the hint for a moment", () => {
        vi.useFakeTimers();
        const { tile, leaflet, hint } = setUp();

        tile.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: 100 }));

        expect(leaflet).not.toHaveBeenCalled();
        expect(hint.classList.contains("is-visible")).toBe(true);
        vi.advanceTimersByTime(1500);
        expect(hint.classList.contains("is-visible")).toBe(false);
    });

    it("also on the container itself", () => {
        const { container, leaflet } = setUp();
        container.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: 100 }));
        expect(leaflet).not.toHaveBeenCalled();
    });

    it("lets the map zoom with Ctrl or Cmd", () => {
        const { tile, leaflet, hint } = setUp();

        tile.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: 100, ctrlKey: true }));
        tile.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: 100, metaKey: true }));

        expect(leaflet).toHaveBeenCalledTimes(2);
        expect(hint.classList.contains("is-visible")).toBe(false);
    });

    it("removes the hint and stops filtering when it is removed", () => {
        const { container, tile, leaflet, remove } = setUp();
        remove();

        tile.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: 100 }));

        expect(leaflet).toHaveBeenCalledTimes(1);
        expect(container.querySelector(".map-zoom-hint")).toBeNull();
    });
});
