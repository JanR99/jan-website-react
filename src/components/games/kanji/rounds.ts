import { shuffle } from "../../../utils/chance";
import { CEFR_LEVELS } from "../../../utils/crossword";
import type { KanjiWord } from "../../../utils/kanjiReading";
import { recentPicks } from "../../../utils/recentPicks";

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

const recentKanji = recentPicks();

let nextRoundId = 1;

/** The words up to the level: A2 means A1 and A2. */
export function wordsUpTo(words: KanjiWord[], level: string): KanjiWord[] {
    const allowed = LEVELS.slice(0, LEVELS.indexOf(level as (typeof LEVELS)[number]) + 1) as readonly string[];
    return words.filter((word) => allowed.includes(word.l));
}

/** Ten words up to the level, words of the last rounds only when there are too few others. */
export function newRound(words: KanjiWord[], level: string, mode: Mode): Round {
    const picked = recentKanji.pick(wordsUpTo(words, level), ROUND_LENGTH, (word) => word.k);
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
