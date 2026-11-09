import { describe, expect, it } from "vitest";
import { isKana } from "wanakana";
import { CEFR_LEVELS } from "./crossword";
import type { ExtraWord } from "./vocab";
import file from "../../public/games/vocab-extra.json";

/** The words added by hand: a mistake in the file shows up here and not only in the game. */
const extra = file as ExtraWord[];

describe("public/games/vocab-extra.json", () => {
    it("has a word, a meaning and a level for every entry, and a reading only in kana", () => {
        for (const entry of extra) {
            const name = JSON.stringify(entry);
            expect(entry.word?.trim(), name).toBeTruthy();
            expect(entry.meaning?.trim(), name).toBeTruthy();
            expect(CEFR_LEVELS, name).toContain(entry.level);
            if (entry.reading !== undefined) expect(isKana(entry.reading), name).toBe(true);
        }
    });

    it("has every word only once per level", () => {
        const keys = extra.map((entry) => `${entry.level} ${entry.word}`);
        expect(keys.filter((key, i) => keys.indexOf(key) !== i)).toEqual([]);
    });
});
