import { describe, expect, it } from "vitest";
import { retryPause } from "./retry";

describe("retryPause", () => {
    it("waits 3 seconds after the first failure", () => {
        expect(retryPause(1)).toBe(3_000);
    });

    it("waits twice as long after every further failure", () => {
        expect([2, 3, 4, 5].map(retryPause)).toEqual([6_000, 12_000, 24_000, 48_000]);
    });

    it("never waits longer than a minute", () => {
        expect(retryPause(6)).toBe(60_000);
        expect(retryPause(50)).toBe(60_000);
    });
});
