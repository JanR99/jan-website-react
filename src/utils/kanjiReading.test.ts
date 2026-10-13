import { describe, expect, it } from "vitest";
import { isRightReading, otherReadings, readingAsKana, type KanjiWord } from "./kanjiReading";

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

describe("otherReadings", () => {
    const word = (k: string, r: string, l = "A1"): KanjiWord => ({ k, r, en: "", l });
    const list = [
        word("人", "hito"), word("日本人", "Nihonjin"), word("人々", "hitobito", "A2"), word("外人", "gaijin", "A2"),
        word("人気", "ninki", "A2"), word("人口", "jinkō", "B1"), word("本", "hon"), word("本屋", "hon'ya"),
        word("日本", "Nihon"), word("お金", "okane"), word("金", "kane"), word("金曜", "kin'yō"),
        word("高い", "takai"), word("高校", "kōkō", "A2"),
    ];

    it("finds words where the kanji is read differently, easiest first", () => {
        expect(otherReadings(list[0], list).map((w) => w.k)).toEqual(["日本人", "外人", "人気"]);
    });

    it("leaves out words with the same reading", () => {
        expect(otherReadings(word("本", "hon"), list)).toEqual([]);
        expect(otherReadings(word("金", "kane"), list).map((w) => w.k)).toEqual(["金曜"]);
    });

    it("takes the kana around the kanji off", () => {
        expect(otherReadings(word("高い", "takai"), list).map((w) => w.k)).toEqual(["高校"]);
        expect(otherReadings(word("お金", "okane"), list).map((w) => w.k)).toEqual(["金曜"]);
    });

    it("doesn't give the same reading or word twice", () => {
        const more = [word("開く", "hiraku"), word("開園", "kaien"), word("開演", "kaien"), word("下手", "heta"),
            word("下手だ", "heta da"), word("開ける", "akeru", "A2"), word("公開", "kōkai", "B1")];
        expect(otherReadings(more[0], more).map((w) => w.k)).toEqual(["開園", "開ける", "公開"]);
    });

    it("counts a sound change in compounds as the same reading", () => {
        const more = [word("ごみ箱", "gomibako"), word("箱", "hako"), word("本箱", "honbako")];
        expect(otherReadings(more[0], more)).toEqual([]);
    });

    it("gives nothing for words with several kanji", () => {
        expect(otherReadings(word("日本", "Nihon"), list)).toEqual([]);
    });
});
