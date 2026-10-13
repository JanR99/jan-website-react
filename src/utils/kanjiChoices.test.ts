import { describe, expect, it } from "vitest";
import { kanjiChoices } from "./kanjiChoices";
import type { KanjiWord } from "./kanjiReading";

const word = (k: string, r: string, en = k): KanjiWord => ({ k, r, en, l: "A1" });

/** Always the same numbers, so a test gets the same choices every time. */
function seeded(seed: number): () => number {
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

const list = [
    word("高い", "takai", "high"), word("安い", "yasui", "cheap"), word("古い", "furui", "old"), word("新しい", "atarashii", "new"),
    word("高校", "kōkō", "high school"), word("本", "hon", "book"), word("日", "hi", "day"), word("月", "tsuki", "moon"),
    word("大学", "daigaku", "university"), word("学生", "gakusei", "student"), word("先生", "sensei", "teacher"),
    word("生", "nama", "raw"), word("木", "ki", "tree"), word("気", "ki", "spirit"), word("書", "sho", "book"),
];

describe("kanjiChoices", () => {
    it("gives the right word and three others, each once", () => {
        for (const seed of [1, 7, 42]) {
            const choices = kanjiChoices(list[0], list, seeded(seed));
            expect(choices).toHaveLength(4);
            expect(choices).toContain(list[0]);
            expect(new Set(choices.map((c) => c.k)).size).toBe(4);
        }
    });

    it("takes words of the same shape first", () => {
        for (const seed of [1, 3, 9]) {
            const choices = kanjiChoices(list[0], list, seeded(seed)).map((c) => c.k);
            expect(choices).toContain("安い");
            expect(choices).toContain("古い");
        }
    });

    it("prefers words sharing a kanji", () => {
        const choices = kanjiChoices(word("学生", "gakusei", "student"), list, seeded(5)).map((c) => c.k);
        expect(choices).toContain("大学");
        expect(choices).toContain("先生");
    });

    it("leaves out words with the same reading or meaning", () => {
        for (const seed of [1, 2, 3, 4, 5]) {
            const choices = kanjiChoices(word("木", "ki", "tree"), list, seeded(seed)).map((c) => c.k);
            expect(choices).not.toContain("気");
            const book = kanjiChoices(list[5], list, seeded(seed)).map((c) => c.k);
            expect(book).not.toContain("書");
        }
    });
});
