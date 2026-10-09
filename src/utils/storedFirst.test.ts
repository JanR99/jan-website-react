import { describe, expect, it } from "vitest";
import { storedThenFresh } from "./storedFirst";

/** A promise that is settled from outside, to decide which answer comes first. */
function later<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

describe("storedThenFresh", () => {
    it("shows the stored copy first and replaces it when the real answer arrives", async () => {
        const fresh = later<string>();
        const shown: string[] = [];

        const done = storedThenFresh(async () => "stored", () => fresh.promise, (value) => shown.push(value));
        await Promise.resolve();
        await Promise.resolve();
        expect(shown).toEqual(["stored"]);

        fresh.resolve("fresh");

        expect(await done).toBe(true);
        expect(shown).toEqual(["stored", "fresh"]);
    });

    it("shows only the real answer when nothing is stored", async () => {
        const shown: string[] = [];

        const arrived = await storedThenFresh(async () => null, async () => "fresh", (value) => shown.push(value));

        expect(arrived).toBe(true);
        expect(shown).toEqual(["fresh"]);
    });

    it("does not go back to the stored copy when it turns up after the real answer", async () => {
        const stored = later<string | null>();
        const shown: string[] = [];

        await storedThenFresh(() => stored.promise, async () => "fresh", (value) => shown.push(value));
        stored.resolve("stored");
        await Promise.resolve();
        await Promise.resolve();

        expect(shown).toEqual(["fresh"]);
    });

    it("keeps the stored copy when the real answer fails", async () => {
        const shown: string[] = [];

        const arrived = await storedThenFresh(
            async () => "stored",
            async () => { throw new Error("backend down"); },
            (value) => shown.push(value),
        );

        expect(arrived).toBe(false);
        expect(shown).toEqual(["stored"]);
    });

    it("fails when the real answer fails and nothing is stored", async () => {
        const failing = storedThenFresh(async () => null, async () => { throw new Error("backend down"); }, () => {});

        await expect(failing).rejects.toThrow("backend down");
    });

    it("treats a stored copy that can't be read as none", async () => {
        const shown: string[] = [];

        const arrived = await storedThenFresh(
            async () => { throw new Error("no cache"); },
            async () => "fresh",
            (value) => shown.push(value),
        );

        expect(arrived).toBe(true);
        expect(shown).toEqual(["fresh"]);
    });
});
