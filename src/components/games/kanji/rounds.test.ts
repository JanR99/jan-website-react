import { describe, expect, it } from "vitest";
import type { KanjiWord } from "../../../utils/kanjiReading";
import { newRound, practiceRound, ROUND_LENGTH, wordsUpTo } from "./rounds";

const words: KanjiWord[] = Array.from({ length: 40 }, (_, i) => ({
    k: `字${i}`,
    r: `ji${i}`,
    en: `meaning ${i}`,
    l: i < 30 ? "A1" : "B1",
}));

describe("wordsUpTo", () => {
    it("keeps the words up to the level", () => {
        expect(wordsUpTo(words, "A1")).toHaveLength(30);
        expect(wordsUpTo(words, "A2")).toHaveLength(30);
        expect(wordsUpTo(words, "B1")).toHaveLength(40);
    });
});

describe("newRound", () => {
    it("takes ten words of the level, not the ones of the last round", () => {
        const first = newRound(words, "A1", "type");
        const second = newRound(words, "A1", "choose");
        expect(first.words).toHaveLength(ROUND_LENGTH);
        expect(first.words.every((word) => word.l === "A1")).toBe(true);
        expect(second.words.some((word) => first.words.includes(word))).toBe(false);
        expect(second.mode).toBe("choose");
        expect(second.id).not.toBe(first.id);
        expect(second.practice).toBe(false);
    });
});

describe("practiceRound", () => {
    it("asks up to ten mistakes, with the stored reading for words not in the list", () => {
        const mistakes = Array.from({ length: 12 }, (_, i) => ({
            word: i === 0 ? "消えた" : `字${i}`, reading: "kieta", meaning: "gone", wrong: 1, rightInRow: 0,
        }));
        const round = practiceRound(mistakes, new Map(words.map((word) => [word.k, word])), "A1", "type");
        expect(round.practice).toBe(true);
        expect(round.words).toHaveLength(ROUND_LENGTH);
        expect(round.words).toContainEqual({ k: "消えた", r: "kieta", en: "gone", l: "" });
        expect(round.words).toContain(words[1]);
    });
});
