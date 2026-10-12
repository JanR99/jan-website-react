import { readFileSync, writeFileSync } from "node:fs";

interface SourceWord {
    word: string;
    english_translation?: string;
    cefr_level?: string;
    useful_for_flashcard?: boolean;
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
