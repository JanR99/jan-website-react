import { describe, expect, it } from "vitest";
import { hitRate, roundCount } from "./gameStats";

describe("hitRate", () => {
    it("is a whole percentage", () => expect(hitRate(2, 3)).toBe("67 %"));
    it("is a dash before the first answer", () => expect(hitRate(0, 0)).toBe("–"));
});

describe("roundCount", () => {
    it("says Runde for one and Runden otherwise", () => {
        expect(roundCount(1)).toBe("1 Runde");
        expect(roundCount(0)).toBe("0 Runden");
    });
});
