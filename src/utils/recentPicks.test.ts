import { describe, expect, it } from "vitest";
import { recentPicks } from "./recentPicks";

describe("recentPicks", () => {
    const pool = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    const self = (item: string) => item;

    it("takes others than the last round where there are enough", () => {
        const picks = recentPicks();
        const first = picks.pick(pool, 3, self);
        const second = picks.pick(pool, 3, self);

        expect(second.some((item) => first.includes(item))).toBe(false);
    });

    it("takes recent ones only when there are too few others", () => {
        const picks = recentPicks();
        picks.pick(pool, 5, self);

        expect(new Set(picks.pick(pool, 8, self)).size).toBe(8);
    });

    it("remembers at most 60 % of the pool, dropping the oldest", () => {
        const picks = recentPicks();
        picks.remember(["a", "b", "c", "d"], 10);
        picks.remember(["e", "f", "g", "h"], 10);

        expect([...picks.recent()]).toEqual(["c", "d", "e", "f", "g", "h"]);
    });
});
