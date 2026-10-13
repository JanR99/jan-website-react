import { describe, expect, it } from "vitest";
import { isRightReading, readingAsKana } from "./kanjiReading";

describe("isRightReading", () => {
    it("takes the reading as it is", () => {
        expect(isRightReading("hon", "hon")).toBe(true);
        expect(isRightReading("hone", "hon")).toBe(false);
        expect(isRightReading("", "hon")).toBe(false);
        expect(isRightReading("  ", "hon")).toBe(false);
    });

    it("doesn't mind case and spaces", () => {
        expect(isRightReading("nihon", "Nihon")).toBe(true);
        expect(isRightReading(" Hontouni ", "hontō ni")).toBe(true);
        expect(isRightReading("hontō ni", "hontō ni")).toBe(true);
    });

    it("lets long vowels be typed short or doubled", () => {
        for (const typed of ["kyō", "kyo", "kyou", "kyoo"]) expect(isRightReading(typed, "kyō")).toBe(true);
        for (const typed of ["ju", "juu", "jū"]) expect(isRightReading(typed, "jū")).toBe(true);
        expect(isRightReading("kyouu", "kyō")).toBe(false);
    });

    it("knows the n before a vowel or y", () => {
        expect(isRightReading("konya", "kon'ya")).toBe(true);
        expect(isRightReading("kon'ya", "kon'ya")).toBe(true);
        expect(isRightReading("konnya", "kon'ya")).toBe(true);
        expect(isRightReading("sennsei", "sensei")).toBe(true);
        expect(isRightReading("kinniku", "kin'niku")).toBe(true);
    });

    it("takes other romaji and kana for the same sounds", () => {
        expect(isRightReading("si", "shi")).toBe(true);
        expect(isRightReading("tukuru", "tsukuru")).toBe(true);
        expect(isRightReading("ほん", "hon")).toBe(true);
        expect(isRightReading("きょう", "kyō")).toBe(true);
        expect(isRightReading("ホン", "hon")).toBe(true);
    });

    it("takes each of several readings", () => {
        expect(isRightReading("shi", "shi / yon")).toBe(true);
        expect(isRightReading("yon", "shi / yon")).toBe(true);
        expect(isRightReading("shiyon", "shi / yon")).toBe(false);
    });
});

describe("readingAsKana", () => {
    it("writes the reading in hiragana", () => {
        expect(readingAsKana("hon")).toBe("ほん");
        expect(readingAsKana("Nihon")).toBe("にほん");
        expect(readingAsKana("kyō")).toBe("きょう");
        expect(readingAsKana("jū")).toBe("じゅう");
        expect(readingAsKana("kon'ya")).toBe("こんや");
        expect(readingAsKana("hontō ni")).toBe("ほんとうに");
    });

    it("takes the first of several readings", () => {
        expect(readingAsKana("shi / yon")).toBe("し");
    });
});
