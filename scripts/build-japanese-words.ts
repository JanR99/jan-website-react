import { readFileSync, writeFileSync } from "node:fs";

interface SourceWord {
    word: string;
    english_translation?: string;
    cefr_level?: string;
    useful_for_flashcard?: boolean;
    romanization?: string;
    example_sentence_native?: string;
    example_sentence_english?: string;
}

interface GameWord {
    /** the word in hiragana or katakana */
    w: string;
    /** up to three English meanings, the clue */
    en: string;
    /** CEFR level */
    l: string;
}

const SOURCES = [
    { file: "data/japanese-practice/hiragana.json", script: /^[ぁ-ゖー]+$/ },
    { file: "data/japanese-practice/katakana.json", script: /^[ァ-ヺー]+$/ },
];
const TARGET = "public/games/japanese-words.json";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const MIN_LENGTH = 2;
const MAX_LENGTH = 6;
const MAX_MEANINGS = 3;
const MAX_CLUE_LENGTH = 80;

function variantKey(word: string, meaning: string): string {
    const small = "ぁぃぅぇぉァィゥェォヵヶ";
    const big = "あいうえおアイウエオカケ";
    return [...word].map((char) => big[small.indexOf(char)] ?? char).join("").replace(/ー$/, "") + "|" + meaning.toLowerCase();
}

function startsBadly(word: string): boolean {
    // a word can't start with a small kana or ー
    return /^[ゃゅょっぁぃぅぇぉャュョッァィゥェォー]/.test(word);
}

interface GameKanji {
    /** the word in kanji, maybe with kana ("見る") */
    k: string;
    /** the reading in romaji as in the list ("hon", "kyō"; several split by "/") */
    r: string;
    /** up to three English meanings */
    en: string;
    /** CEFR level */
    l: string;
    /** an example sentence and its translation, if the list has one */
    ex?: string;
    exEn?: string;
}

const words: GameWord[] = [];
const seen = new Set<string>();
const dropped = { unsuitable: 0, variant: 0 };

for (const { file, script } of SOURCES) {
    const source = JSON.parse(readFileSync(file, "utf8")) as SourceWord[];
    for (const entry of source) {
        const word = entry.word.trim();
        const english = (entry.english_translation ?? "").trim();
        const level = entry.cefr_level ?? "";
        if (!entry.useful_for_flashcard || !LEVELS.includes(level)) continue;
        if (!script.test(word) || word.length < MIN_LENGTH || word.length > MAX_LENGTH || startsBadly(word)) continue;
        if (!english || english.length > MAX_CLUE_LENGTH || /not applicable/i.test(english)) continue;
        const meanings = english.split(";").map((part) => part.trim()).filter(Boolean);
        // the lists are ordered by how common a word is: the first spelling stays
        const key = variantKey(word, meanings[0] ?? "");
        if (seen.has(key)) {
            dropped.variant++;
            continue;
        }
        seen.add(key);

        words.push({ w: word, en: meanings.slice(0, MAX_MEANINGS).join("; "), l: level });
    }
}

words.sort((a, b) => a.l.localeCompare(b.l) || a.w.localeCompare(b.w, "ja"));
writeFileSync(TARGET, JSON.stringify(words) + "\n");
console.log(`${TARGET}: ${words.length} words (left out: ${dropped.variant} spelling variants)`);

const KANJI_SOURCE = "data/japanese-practice/kanji.json";
const KANJI_TARGET = "public/games/japanese-kanji.json";
const HAS_KANJI = /[\u4e00-\u9fff々]/;
/** a reading that can be typed: romaji with long-vowel marks, spaces, apostrophes, hyphens and "/" between readings */
const TYPABLE_READING = /^[a-zāīūēōïA-ZĀĪŪĒŌ' \-/]+$/;
const MAX_EXAMPLE_LENGTH = 60;

const kanji: GameKanji[] = [];
const seenKanji = new Set<string>();
const droppedKanji = { duplicate: 0 };

for (const entry of JSON.parse(readFileSync(KANJI_SOURCE, "utf8")) as SourceWord[]) {
    const word = entry.word.trim();
    const reading = (entry.romanization ?? "").trim();
    const english = (entry.english_translation ?? "").trim();
    const level = entry.cefr_level ?? "";
    if (!entry.useful_for_flashcard || !LEVELS.includes(level)) continue;
    if (!HAS_KANJI.test(word) || !TYPABLE_READING.test(reading)) continue;
    if (!english || english.length > MAX_CLUE_LENGTH || /not applicable/i.test(english)) continue;
    if (seenKanji.has(word)) {
        droppedKanji.duplicate++;
        continue;
    }
    seenKanji.add(word);

    const item: GameKanji = {
        k: word,
        r: reading,
        en: english.split(";").map((part) => part.trim()).filter(Boolean).slice(0, MAX_MEANINGS).join("; "),
        l: level,
    };
    const example = (entry.example_sentence_native ?? "").trim();
    const exampleEnglish = (entry.example_sentence_english ?? "").trim();
    if (example && exampleEnglish && example.length <= MAX_EXAMPLE_LENGTH) {
        item.ex = example;
        item.exEn = exampleEnglish;
    }
    kanji.push(item);
}

kanji.sort((a, b) => a.l.localeCompare(b.l) || a.k.localeCompare(b.k, "ja"));
writeFileSync(KANJI_TARGET, JSON.stringify(kanji) + "\n");
console.log(`${KANJI_TARGET}: ${kanji.length} words (left out: ${droppedKanji.duplicate} duplicates)`);
