import { toHiragana } from "wanakana";

/** A word of the kanji game, as in public/games/japanese-kanji.json (see scripts/build-japanese-words.ts). */
export interface KanjiWord {
    /** the word in kanji, maybe with kana ("見る") */
    k: string;
    /** the reading in romaji ("hon", "kyō"; several split by "/") */
    r: string;
    /** up to three English meanings */
    en: string;
    /** CEFR level */
    l: string;
    ex?: string;
    exEn?: string;
}

/** The ways to type a long vowel: kyō may be typed as kyo, kyou or kyoo. */
const LONG_VOWELS: Record<string, string[]> = {
    ā: ["a", "aa"],
    ī: ["i", "ii"],
    ū: ["u", "uu"],
    ē: ["e", "ee", "ei"],
    ō: ["o", "ou", "oo"],
};

/** The readings of a word, one per "/", without the long-vowel marks in all the ways to type them. */
function typedForms(reading: string): string[] {
    return reading
        .toLowerCase()
        .replace(/ï/g, "i")
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean)
        .flatMap((part) =>
            [...part].reduce<string[]>(
                (forms, char) => forms.flatMap((form) => (LONG_VOWELS[char] ?? [char]).map((typed) => form + typed)),
                [""],
            ),
        );
}

/** Without spaces, hyphens and apostrophes: "kon'ya" → "konya". */
const plain = (text: string) => text.replace(/[\s'’-]/g, "");

/** The keys a reading is compared by: the plain romaji and the hiragana it spells. */
function readingKeys(reading: string): Set<string> {
    const keys = new Set<string>();
    for (const form of typedForms(reading)) {
        keys.add(plain(form));
        // the apostrophe tells n from a following vowel or y: kon'ya → こんや
        keys.add(toHiragana(form.replace(/[\s-]/g, "")));
    }
    return keys;
}

/**
 * Whether the typed text is a reading of the word. Forgiving: case, spaces and apostrophes don't matter,
 * long vowels may be typed short or doubled (kyo, kyou, kyoo for kyō), and kana or romaji the way an IME
 * takes them (konnya for kon'ya, si for shi) count too.
 */
export function isRightReading(typed: string, reading: string): boolean {
    const keys = readingKeys(reading);
    const input = typed.trim().toLowerCase().replace(/ï/g, "i").replace(/[āīūēō]/g, (char) => LONG_VOWELS[char][1]);
    if (!plain(input)) return false;
    const typedNoSpaces = input.replace(/[\s-]/g, "");
    return [plain(input), toHiragana(typedNoSpaces), toHiragana(typedNoSpaces, { IMEMode: true })].some((key) => keys.has(key));
}
