import type { KanjiMistake } from "../../../types/games";
import { shuffle } from "../../../utils/chance";
import { CEFR_LEVELS } from "../../../utils/crossword";
import type { KanjiWord } from "../../../utils/kanjiReading";

export const ROUND_LENGTH = 10;
/** The levels to choose from; C2 has hardly any words of its own. */
export const LEVELS = CEFR_LEVELS.slice(0, 5);

/** type: the reading is typed for the kanji; choose: the kanji is picked out of four for reading and meaning */
export type Mode = "type" | "choose";

export const MODES: { value: Mode; label: string }[] = [
    { value: "type", label: "Lesung tippen" },
    { value: "choose", label: "Kanji wählen" },
];

export interface Round {
    id: number;
    words: KanjiWord[];
    level: string;
    mode: Mode;
    /** a round of the own mistakes: it changes only the list of mistakes, not the numbers */
    practice: boolean;
}

/** One answer of a round: what was typed or chosen ("" for "Weiß ich nicht") and whether it was right. */
export interface Answer {
    typed: string;
    right: boolean;
}

/** The words of the last rounds of this visit, oldest first; a new round takes others where it can. */
const recentKanji: string[] = [];
/** how much of the words of a level is remembered as recent, so a small level doesn't run out of words */
const RECENT_SHARE = 0.6;

let nextRoundId = 1;

/** The words up to the level: A2 means A1 and A2. */
export function wordsUpTo(words: KanjiWord[], level: string): KanjiWord[] {
    const allowed = LEVELS.slice(0, LEVELS.indexOf(level as (typeof LEVELS)[number]) + 1) as readonly string[];
    return words.filter((word) => allowed.includes(word.l));
}

/** Ten words up to the level, words of the last rounds only when there are too few others. */
export function newRound(words: KanjiWord[], level: string, mode: Mode): Round {
    const pool = wordsUpTo(words, level);
    const recent = new Set(recentKanji);
    const picked = [
        ...shuffle(pool.filter((word) => !recent.has(word.k))),
        ...shuffle(pool.filter((word) => recent.has(word.k))),
    ].slice(0, ROUND_LENGTH);
    recentKanji.push(...picked.map((word) => word.k));
    recentKanji.splice(0, Math.max(0, recentKanji.length - Math.floor(pool.length * RECENT_SHARE)));
    return { id: nextRoundId++, words: picked, level, mode, practice: false };
}

/**
 * Up to ten of the own mistakes, most often wrong first. The word list gives the example sentence; a word that
 * isn't in it any more is asked with the reading and meaning stored with the mistake.
 */
export function practiceRound(mistakes: KanjiMistake[], wordByKanji: Map<string, KanjiWord>, level: string, mode: Mode): Round {
    const picked = mistakes.slice(0, ROUND_LENGTH).map((mistake) =>
        wordByKanji.get(mistake.word) ?? { k: mistake.word, r: mistake.reading, en: mistake.meaning, l: "" },
    );
    return { id: nextRoundId++, words: shuffle(picked), level, mode, practice: true };
}
