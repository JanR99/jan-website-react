import { describe, expect, it } from "vitest";
import { passwordProblem } from "./password";

describe("passwordProblem", () => {
    it("accepts 8 to 72 characters", () => {
        expect(passwordProblem("a".repeat(8))).toBeNull();
        expect(passwordProblem("a".repeat(72))).toBeNull();
    });

    it("rejects fewer than 8 characters", () => {
        expect(passwordProblem("")).toMatch(/mindestens 8 Zeichen/);
        expect(passwordProblem("a".repeat(7))).toMatch(/mindestens 8 Zeichen/);
    });

    it("rejects more than 72 bytes", () => {
        expect(passwordProblem("a".repeat(73))).toMatch(/zu lang/);
    });

    it("counts umlauts and emojis by their bytes", () => {
        // ä has 2 bytes, an emoji 4
        expect(passwordProblem("ä".repeat(36))).toBeNull();
        expect(passwordProblem("ä".repeat(37))).toMatch(/zu lang/);
        expect(passwordProblem("a".repeat(69) + "😀")).toMatch(/zu lang/);
    });
});
