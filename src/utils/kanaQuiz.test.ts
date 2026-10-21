import { describe, expect, it } from "vitest";
import { isRightKana, KANA_GROUPS, kanaPool, kanaRomaji, newKanaRound, otherScript, practiceKanaRound, ROUND_LENGTH } from "./kanaQuiz";

describe("KANA_GROUPS", () => {
    it("has the 46 basic characters, 25 with ゛ or ゜ and 33 combinations", () => {
        expect(KANA_GROUPS.map((group) => group.chars.length)).toEqual([46, 25, 33]);
        const all = KANA_GROUPS.flatMap((group) => group.chars);
        expect(new Set(all).size).toBe(all.length);
    });
});

describe("kanaPool", () => {
    it("takes the chosen groups in the chosen script", () => {
        expect(kanaPool(["basic"], "hiragana")).toContain("あ");
        expect(kanaPool(["basic"], "hiragana")).not.toContain("が");
        expect(kanaPool(["basic"], "katakana")).toContain("ア");
        expect(kanaPool(["basic"], "katakana")).not.toContain("あ");
        expect(kanaPool(["combo"], "katakana")).toContain("キャ");
    });

    it("has every character in both scripts for both", () => {
        const pool = kanaPool(["basic", "marked"], "both");
        expect(pool).toHaveLength(2 * (46 + 25));
        expect(pool).toContain("ぱ");
        expect(pool).toContain("パ");
    });

    it("is empty without a group", () => {
        expect(kanaPool([], "both")).toEqual([]);
    });
});

describe("newKanaRound", () => {
    it("asks ten different characters of the pool", () => {
        const round = newKanaRound(["basic"], "hiragana");
        expect(round.kana).toHaveLength(ROUND_LENGTH);
        expect(new Set(round.kana).size).toBe(ROUND_LENGTH);
        for (const kana of round.kana) expect(kanaPool(["basic"], "hiragana")).toContain(kana);
    });

    it("takes the characters of the last round only when there are too few others", () => {
        const first = newKanaRound(["basic"], "katakana");
        const second = newKanaRound(["basic"], "katakana");
        expect(second.kana.filter((kana) => first.kana.includes(kana))).toEqual([]);
    });
});

describe("practiceKanaRound", () => {
    it("asks the ten mistakes made most often", () => {
        const mistakes = [..."あいうえおかきくけこさし"];
        const round = practiceKanaRound(mistakes);
        expect(round.practice).toBe(true);
        expect([...round.kana].sort()).toEqual(mistakes.slice(0, ROUND_LENGTH).sort());
    });

    it("asks fewer when there are fewer mistakes", () => {
        expect(practiceKanaRound(["し", "ツ"]).kana).toHaveLength(2);
    });
});

describe("isRightKana", () => {
    it("takes the usual romaji", () => {
        expect(isRightKana("a", "あ")).toBe(true);
        expect(isRightKana("shi", "し")).toBe(true);
        expect(isRightKana("tsu", "ツ")).toBe(true);
        expect(isRightKana("kya", "きゃ")).toBe(true);
        expect(isRightKana("ja", "ジャ")).toBe(true);
        expect(isRightKana("n", "ん")).toBe(true);
        expect(isRightKana("ka", "き")).toBe(false);
        expect(isRightKana("kiya", "きゃ")).toBe(false);
    });

    it("doesn't mind case and spaces", () => {
        expect(isRightKana(" Shi ", "し")).toBe(true);
        expect(isRightKana("", "し")).toBe(false);
        expect(isRightKana("  ", "し")).toBe(false);
    });

    it("takes other ways of writing romaji", () => {
        for (const [typed, kana] of [["si", "し"], ["ti", "ち"], ["tu", "つ"], ["hu", "ふ"], ["zi", "じ"], ["sya", "しゃ"], ["tya", "ちゃ"], ["jya", "じゃ"], ["nn", "ん"], ["wo", "を"]]) {
            expect(isRightKana(typed, kana)).toBe(true);
        }
    });

    it("takes the romaji of the character that sounds the same", () => {
        expect(isRightKana("ji", "ぢ")).toBe(true);
        expect(isRightKana("di", "ぢ")).toBe(true);
        expect(isRightKana("zu", "ヅ")).toBe(true);
        expect(isRightKana("o", "を")).toBe(true);
        // not the other way round
        expect(isRightKana("wo", "お")).toBe(false);
    });

    it("takes kana in either script", () => {
        expect(isRightKana("し", "し")).toBe(true);
        expect(isRightKana("シ", "し")).toBe(true);
        expect(isRightKana("きゃ", "キャ")).toBe(true);
        expect(isRightKana("さ", "し")).toBe(false);
    });
});

describe("kanaRomaji and otherScript", () => {
    it("writes the romaji the usual way", () => {
        expect(["し", "ち", "つ", "ふ", "を", "ん", "ヂ", "しゃ"].map(kanaRomaji)).toEqual(["shi", "chi", "tsu", "fu", "wo", "n", "ji", "sha"]);
    });

    it("gives the character in the other script", () => {
        expect(otherScript("あ")).toBe("ア");
        expect(otherScript("キャ")).toBe("きゃ");
    });
});
