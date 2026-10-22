import { toHiragana } from "wanakana";
import { CEFR_LEVELS } from "./crossword";

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

/**
 * The (first) reading in hiragana, for reading it aloud: "kyō" → "きょう", "kon'ya" → "こんや".
 * A long o is written おう, which sounds the same as おお.
 */
export function readingAsKana(reading: string): string {
    const first = reading.split("/")[0].trim().toLowerCase().replace(/ï/g, "i");
    const typed = first.replace(/[āīūēō]/g, (char) => ({ ā: "aa", ī: "ii", ū: "uu", ē: "ee", ō: "ou" })[char] ?? char);
    return toHiragana(typed.replace(/[\s-]/g, ""));
}

/** A kanji (CJK unified ideographs) or the repeat mark 々. */
export const KANJI = /[\u4e00-\u9fff々]/;
const LEVEL_ORDER: readonly string[] = CEFR_LEVELS;

/** Kana without ゛ and ゜, so a sound change in compounds still counts as the same reading: ばこ (ごみ箱) as はこ. */
const withoutMarks = (kana: string) => kana.normalize("NFD").replace(/[\u3099\u309a]/g, "");

/**
 * For a word with a single kanji (maybe with kana around it, like 高い or お金): up to `max` other words of the
 * list with that kanji where it is read differently, easiest first. 人 (hito) gives 日本人 (nihonjin) or 人気 (ninki),
 * but not 人々 (hitobito). Empty for words with several kanji and for kanji always read the same in the list.
 */
export function otherReadings(word: KanjiWord, words: KanjiWord[], max = 3): KanjiWord[] {
    const kanji = [...word.k].filter((char) => KANJI.test(char));
    if (new Set(kanji).size !== 1) return [];
    const [char] = kanji;
    // the reading of the kanji alone: the kana around it taken off, as in 高い → たか, お金 → かね
    const before = word.k.slice(0, word.k.indexOf(char));
    const after = word.k.slice(word.k.lastIndexOf(char) + 1);
    let stem = readingAsKana(word.r);
    if (before && stem.startsWith(before)) stem = stem.slice(before.length);
    if (after && stem.endsWith(after)) stem = stem.slice(0, stem.length - after.length);
    if (!stem) return [];
    stem = withoutMarks(stem);

    const candidates = words
        .filter((other) => other.k !== word.k && other.k.includes(char) && !withoutMarks(readingAsKana(other.r)).includes(stem))
        .sort((a, b) => LEVEL_ORDER.indexOf(a.l) - LEVEL_ORDER.indexOf(b.l) || a.k.length - b.k.length);
    // different examples: not the same reading twice (開園, 開演 kaien), not a word inside another (下手, 下手だ)
    const picked: KanjiWord[] = [];
    for (const other of candidates) {
        if (picked.length === max) break;
        const repeats = picked.some((chosen) =>
            readingAsKana(chosen.r) === readingAsKana(other.r) || chosen.k.includes(other.k) || other.k.includes(chosen.k));
        if (!repeats) picked.push(other);
    }
    return picked;
}
