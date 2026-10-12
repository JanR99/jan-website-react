import { describe, expect, it } from "vitest";
import { cellKey, entryCells, generateCrossword, solutionGrid, wordsUpTo, type JapaneseWord } from "./crossword";
import { isKatakanaWord, modifyKana, toKatakanaChar } from "./kana";

const words: JapaneseWord[] = [
    "かさ", "さくら", "らいおん", "おかし", "しかく", "くるま", "まいにち", "ちから", "テレビ", "ビール", "ルール", "テスト",
].map((w, i) => ({ w, en: `meaning ${i}`, l: i < 6 ? "A1" : "B1" }));

/** Always the same numbers, so a test gets the same crossword every time. */
function seeded(seed: number): () => number {
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

describe("wordsUpTo", () => {
    it("keeps the words up to the level", () => {
        expect(wordsUpTo(words, "A1", 6)).toHaveLength(6);
        expect(wordsUpTo(words, "B1", 6)).toHaveLength(12);
        expect(wordsUpTo(words, "B1", 3).every((w) => w.w.length <= 3)).toBe(true);
    });
});

describe("generateCrossword", () => {
    for (const seed of [1, 7, 42, 1234]) {
        it(`builds a consistent crossword (seed ${seed})`, () => {
            const crossword = generateCrossword(words, 6, 10, seeded(seed));
            expect(crossword.entries.length).toBeGreaterThan(1);
            expect(crossword.width).toBeLessThanOrEqual(10);
            expect(crossword.height).toBeLessThanOrEqual(10);

            // crossing words agree on their shared squares and nothing lies outside the grid
            const seen = new Map<string, string>();
            for (const entry of crossword.entries) {
                entryCells(entry).forEach(([r, c], i) => {
                    expect(r).toBeGreaterThanOrEqual(0);
                    expect(c).toBeGreaterThanOrEqual(0);
                    expect(r).toBeLessThan(crossword.height);
                    expect(c).toBeLessThan(crossword.width);
                    const existing = seen.get(cellKey(r, c));
                    if (existing) expect(existing).toBe(entry.word[i]);
                    seen.set(cellKey(r, c), entry.word[i]);
                });
            }
            expect(solutionGrid(crossword).size).toBe(seen.size);

            // every word but the first crosses another one
            const crossed = crossword.entries.filter((entry) =>
                entryCells(entry).some(([r, c]) =>
                    crossword.entries.some((other) => other !== entry && entryCells(other).some(([r2, c2]) => r2 === r && c2 === c))));
            expect(crossed).toHaveLength(crossword.entries.length);

            // no word twice, numbers start at 1
            expect(new Set(crossword.entries.map((e) => e.word)).size).toBe(crossword.entries.length);
            expect(Math.min(...crossword.entries.map((e) => e.number))).toBe(1);
        });
    }

    it("gives an empty crossword without words", () => {
        expect(generateCrossword([], 5).entries).toEqual([]);
    });
});

describe("kana keys", () => {
    it("adds and removes the marks", () => {
        expect(modifyKana("か", "dakuten")).toBe("が");
        expect(modifyKana("が", "dakuten")).toBe("か");
        expect(modifyKana("は", "handakuten")).toBe("ぱ");
        expect(modifyKana("ぱ", "dakuten")).toBe("ば");
        expect(modifyKana("ば", "handakuten")).toBe("ぱ");
        expect(modifyKana("う", "dakuten")).toBe("ゔ");
    });

    it("makes characters small and big again", () => {
        expect(modifyKana("つ", "small")).toBe("っ");
        expect(modifyKana("ゃ", "small")).toBe("や");
        expect(modifyKana("ツ", "small")).toBe("ッ");
    });

    it("leaves characters a key doesn't apply to", () => {
        expect(modifyKana("な", "dakuten")).toBe("な");
        expect(modifyKana("か", "small")).toBe("か");
        expect(modifyKana("ー", "dakuten")).toBe("ー");
    });

    it("works for katakana", () => {
        expect(modifyKana("カ", "dakuten")).toBe("ガ");
        expect(modifyKana("ホ", "handakuten")).toBe("ポ");
        expect(toKatakanaChar("さ")).toBe("サ");
        expect(toKatakanaChar("ー")).toBe("ー");
    });

    it("knows katakana words", () => {
        expect(isKatakanaWord("ゲーム")).toBe(true);
        expect(isKatakanaWord("さくら")).toBe(false);
    });
});
