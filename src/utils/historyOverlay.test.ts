import { describe, expect, it } from "vitest";
import { openedOverlay, withOverlay } from "./historyOverlay";

describe("withOverlay", () => {
    it("notes the view and what it was opened with", () => {
        expect(withOverlay(null, "photo", 3)).toEqual({ overlay: { name: "photo", value: 3 } });
    });

    it("keeps what the entry of the page carried", () => {
        const pageState = { recipe: { id: 1 }, from: "/cookbook" };

        expect(withOverlay(pageState, "cook", true)).toEqual({ ...pageState, overlay: { name: "cook", value: true } });
    });
});

describe("openedOverlay", () => {
    it("finds the view in the entry it was opened with", () => {
        expect(openedOverlay(withOverlay(null, "photo", 3), "photo")).toEqual({ name: "photo", value: 3 });
    });

    it("finds a view opened with the first photo, whose number is 0", () => {
        expect(openedOverlay(withOverlay(null, "photo", 0), "photo")?.value).toBe(0);
    });

    it("finds nothing in the entry of the page itself", () => {
        expect(openedOverlay(null, "photo")).toBeUndefined();
        expect(openedOverlay(undefined, "photo")).toBeUndefined();
        expect(openedOverlay({ recipe: { id: 1 }, from: "/cookbook" }, "cook")).toBeUndefined();
    });

    it("finds nothing in the entry of another view", () => {
        expect(openedOverlay(withOverlay(null, "cook", true), "photo")).toBeUndefined();
    });
});
