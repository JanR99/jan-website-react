import { describe, expect, it } from "vitest";
import { createScrollMemory } from "./scrollMemory";

describe("createScrollMemory", () => {
    it("starts a page opened by a link at the top", () => {
        const memory = createScrollMemory();
        memory.enter("a", "/cookbook", false);
        memory.scrolled(800);
        memory.leave("a");

        expect(memory.enter("b", "/cookbook/ramen", false)).toBe(0);
    });

    it("returns to the place where a page was left when going back", () => {
        const memory = createScrollMemory();
        memory.enter("a", "/cookbook", false);
        memory.scrolled(800);
        memory.leave("a");
        memory.enter("b", "/cookbook/ramen", false);
        memory.scrolled(300);
        memory.leave("b");

        expect(memory.enter("a", "/cookbook", true)).toBe(800);
    });

    it("does the same when going forward again", () => {
        const memory = createScrollMemory();
        memory.enter("a", "/cookbook", false);
        memory.leave("a");
        memory.enter("b", "/cookbook/ramen", false);
        memory.scrolled(300);
        memory.leave("b");
        memory.enter("a", "/cookbook", true);
        memory.leave("a");

        expect(memory.enter("b", "/cookbook/ramen", true)).toBe(300);
    });

    it("starts at the top when the same page is opened by a link again", () => {
        const memory = createScrollMemory();
        memory.enter("a", "/cookbook", false);
        memory.scrolled(800);
        memory.leave("a");
        memory.enter("b", "/", false);
        memory.leave("b");

        expect(memory.enter("c", "/cookbook", false)).toBe(0);
    });

    it("starts at the top on a page it knows nothing about, like after a reload", () => {
        const memory = createScrollMemory();

        expect(memory.enter("a", "/cookbook", true)).toBe(0);
    });

    it("stays where it is while only the address of the same page changes", () => {
        const memory = createScrollMemory();
        memory.enter("a", "/cookbook", false);
        memory.scrolled(800);
        memory.leave("a");

        // typing in the search replaces the address, which gives the history entry a new key
        expect(memory.enter("a2", "/cookbook", false)).toBeNull();
    });

    it("remembers the place under the last key of a page whose address changed", () => {
        const memory = createScrollMemory();
        memory.enter("a", "/cookbook", false);
        memory.scrolled(800);
        memory.leave("a");
        memory.enter("a2", "/cookbook", false);
        memory.leave("a2");
        memory.enter("b", "/cookbook/ramen", false);
        memory.leave("b");

        expect(memory.enter("a2", "/cookbook", true)).toBe(800);
    });
});
