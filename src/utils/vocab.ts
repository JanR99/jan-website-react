import { shuffle } from "./chance";
import type { JapaneseWord } from "./crossword";
import { readingAsKana, type KanjiWord } from "./kanjiReading";

export const ROUND_LENGTH = 10;

/** A word of the vocabulary trainer: in kanji with its reading in hiragana, or only in kana (reading ""). */
export interface VocabWord {
    word: string;
    reading: string;
    meaning: string;
    level: string;
}

/**
 * A word added by hand in public/games/vocab-extra.json, like
 * { "word": "犬", "reading": "いぬ", "meaning": "dog", "level": "A1" }.
 * The reading is in kana and left out for words written in kana; several meanings are separated by ";".
 */
export interface ExtraWord {
    word: string;
    reading?: string;
    meaning: string;
    level: string;
}

/**
 * The words of one level: the ones added by hand, the kanji words and the kana words. A word in several lists is
 * taken once, the one added by hand first, so it can correct a word of the lists.
 */
export function vocabWords(kanji: KanjiWord[], kana: JapaneseWord[], extra: ExtraWord[], level: string): VocabWord[] {
    const words = new Map<string, VocabWord>();
    for (const word of extra) {
        if (word.level === level && !words.has(word.word)) {
            words.set(word.word, { word: word.word, reading: word.reading ?? "", meaning: word.meaning, level });
        }
    }
    for (const word of kanji) {
        if (word.l === level && !words.has(word.k)) {
            words.set(word.k, { word: word.k, reading: readingAsKana(word.r), meaning: word.en, level });
        }
    }
    for (const word of kana) {
        if (word.l === level && !words.has(word.w)) {
            words.set(word.w, { word: word.w, reading: "", meaning: word.en, level });
        }
    }
    return [...words.values()];
}

/**
 * Ten words: first the ones that are due, longest due first, then new ones the user hasn't had at this level,
 * chosen by chance. Words that are not due yet only come when there are no others left.
 */
export function vocabRound(words: VocabWord[], cards: VocabCard[], now: number, random: () => number = Math.random): VocabWord[] {
    const byWord = new Map(words.map((word) => [word.word, word]));
    const had = new Set(cards.map((card) => card.word));
    const sorted = [...cards].sort((a, b) => a.dueAt - b.dueAt);
    const due = sorted.filter((card) => card.dueAt <= now).map((card) => byWord.get(card.word));
    const fresh = shuffle(words.filter((word) => !had.has(word.word)), random);
    const later = sorted.filter((card) => card.dueAt > now).map((card) => byWord.get(card.word));
    const picked = [...due, ...fresh, ...later].filter((word): word is VocabWord => word !== undefined).slice(0, ROUND_LENGTH);
    return shuffle(picked, random);
}

/** "To sell (well)" → "sell": lower case, without accents, brackets, "to", "a", "an", "the" and punctuation. */
function normalize(meaning: string): string {
    return meaning
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\([^)]*\)/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/^(to|a|an|the) /, "")
        .trim();
}

/** At most one letter added, left out or changed. */
function oneEditApart(a: string, b: string): boolean {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    let j = 0;
    while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
    return a.length - i - j <= 1 && b.length - i - j <= 1;
}

/**
 * Whether the typed text is one of the meanings ("sweets; candy; snack"). Forgiving: case, "to", "a", "the",
 * brackets and punctuation don't matter, and for words of five letters or more one typo is allowed.
 */
export function isRightMeaning(typed: string, meaning: string): boolean {
    const answer = normalize(typed);
    if (!answer) return false;
    return meaning
        .split(/[;,/]/)
        .map(normalize)
        .filter(Boolean)
        .some((option) => option === answer || (option.length >= 5 && oneEditApart(option, answer)));
}
