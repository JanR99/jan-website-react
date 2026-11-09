import { describe, expect, it } from "vitest";
import { isRightMeaning, ROUND_LENGTH, vocabRound, vocabWords, type VocabWord } from "./vocab";

describe("vocabWords", () => {
    it("takes the kanji and kana words of the level, each word once", () => {
        const words = vocabWords(
            [
                { k: "外", r: "soto", en: "outside", l: "A1" },
                { k: "東京", r: "Tōkyō", en: "Tokyo", l: "A1" },
                { k: "売る", r: "uru", en: "to sell", l: "A2" },
            ],
            [
                { w: "アイス", en: "ice cream", l: "A1" },
                { w: "外", en: "outside", l: "A1" },
                { w: "あう", en: "to meet", l: "A2" },
            ],
            "A1",
        );

        expect(words).toEqual([
            { word: "外", reading: "そと", meaning: "outside", level: "A1" },
            { word: "東京", reading: "とうきょう", meaning: "Tokyo", level: "A1" },
            { word: "アイス", reading: "", meaning: "ice cream", level: "A1" },
        ]);
    });
});

describe("vocabRound", () => {
    const words: VocabWord[] = Array.from({ length: 30 }, (_, i) => ({ word: `w${i}`, reading: "", meaning: "", level: "A1" }));
    const now = 1_000_000;
    // keeps the order, so the tests can see which words were picked
    const noShuffle = () => 0.999999;

    it("takes the due words first, longest due first, then new ones, and words not due yet last", () => {
        const cards: VocabCard[] = [
            { word: "w0", box: 3, dueAt: now + 1 },
            { word: "w1", box: 0, dueAt: now - 10 },
            { word: "w2", box: 1, dueAt: now - 20 },
            ...words.slice(3, 25).map((word) => ({ word: word.word, box: 2, dueAt: now + 100 })),
        ];

        const round = vocabRound(words, cards, now, noShuffle).map((word) => word.word);

        expect(round).toHaveLength(ROUND_LENGTH);
        expect(round.slice(0, 2)).toEqual(["w2", "w1"]);
        expect(round.slice(2, 7).sort()).toEqual(["w25", "w26", "w27", "w28", "w29"]);
        expect(round).toContain("w0");
    });

    it("leaves out words that are no longer in the list", () => {
        const round = vocabRound(words.slice(0, 2), [{ word: "gone", box: 0, dueAt: 0 }], now);

        expect(round.map((word) => word.word).sort()).toEqual(["w0", "w1"]);
    });
});

describe("isRightMeaning", () => {
    it("takes each of the meanings", () => {
        expect(isRightMeaning("candy", "sweets; candy; snack")).toBe(true);
        expect(isRightMeaning("snack", "sweets; candy; snack")).toBe(true);
        expect(isRightMeaning("cake", "sweets; candy; snack")).toBe(false);
    });

    it("doesn't care about case, to, a, the and brackets", () => {
        expect(isRightMeaning("Sell", "to sell (well); to be sold")).toBe(true);
        expect(isRightMeaning("to be sold", "to sell (well); to be sold")).toBe(true);
        expect(isRightMeaning("the house", "house; home (polite)")).toBe(true);
        expect(isRightMeaning("  oolong-tea ", "oolong tea")).toBe(true);
    });

    it("allows one typo in longer words only", () => {
        expect(isRightMeaning("outsde", "outside")).toBe(true);
        expect(isRightMeaning("outsidee", "outside")).toBe(true);
        expect(isRightMeaning("ousdie", "outside")).toBe(false);
        expect(isRightMeaning("rad", "red")).toBe(false);
    });

    it("takes nothing for an empty answer", () => {
        expect(isRightMeaning("", "outside")).toBe(false);
        expect(isRightMeaning("the", "the end")).toBe(false);
    });
});
