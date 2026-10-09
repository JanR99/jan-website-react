import { describe, expect, it } from "vitest";
import { chosenByChance } from "./chance";

describe("chosenByChance", () => {
    const items = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, title: `Rezept ${i + 1}` }));
    const ids = (chosen: { id: number }[]) => chosen.map((item) => item.id);

    it("chooses as many different things as asked for", () => {
        const chosen = chosenByChance(items, 4, 0.37);

        expect(chosen).toHaveLength(4);
        expect(new Set(ids(chosen)).size).toBe(4);
    });

    it("chooses the same ones again for the same seed", () => {
        expect(ids(chosenByChance(items, 4, 0.37))).toEqual(ids(chosenByChance(items, 4, 0.37)));
    });

    it("keeps its choice when the list comes in another order or as new objects", () => {
        const loadedAgain = items.map((item) => ({ ...item })).reverse();

        expect(ids(chosenByChance(loadedAgain, 4, 0.37))).toEqual(ids(chosenByChance(items, 4, 0.37)));
    });

    it("chooses differently for other seeds, and everything gets its turn", () => {
        const seeds = Array.from({ length: 200 }, (_, i) => (i + 0.5) / 200);
        const choices = seeds.map((seed) => ids(chosenByChance(items, 4, seed)));

        expect(new Set(choices.map(String)).size).toBeGreaterThan(50);
        expect(new Set(choices.flat()).size).toBe(items.length);
    });

    it("takes everything when there is not more than asked for", () => {
        expect(ids(chosenByChance(items.slice(0, 3), 4, 0.37)).sort()).toEqual([1, 2, 3]);
        expect(chosenByChance([], 4, 0.37)).toEqual([]);
    });

    it("leaves the given list as it is", () => {
        const before = ids(items);

        chosenByChance(items, 4, 0.37);

        expect(ids(items)).toEqual(before);
    });
});
