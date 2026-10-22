import { bestCrossword, CEFR_LEVELS, wordsUpTo, type Crossword, type JapaneseWord } from "../../../utils/crossword";
import { isKatakanaWord } from "../../../utils/kana";
import { recentPicks } from "../../../utils/recentPicks";

const WORD_COUNT = 10;
const MAX_SIZE = 10;
const MAX_WORD_LENGTH = 6;
/** The levels to choose from; C2 has hardly any words of its own. */
export const LEVELS = CEFR_LEVELS.slice(0, 5);

export type Script = "hiragana" | "katakana" | "both";

export const SCRIPTS: { value: Script; label: string }[] = [
    { value: "hiragana", label: "Hiragana" },
    { value: "katakana", label: "Katakana" },
    { value: "both", label: "Beide" },
];

export interface Puzzle {
    id: number;
    crossword: Crossword;
    /** the script the words are in; with "both" chosen, the one drawn for this puzzle */
    script: CrosswordScript;
    level: string;
}

let nextPuzzleId = 1;

const recentWords = recentPicks();

/** A new crossword of ten words up to the level, in the script; words of the last crosswords only where needed. */
export function newPuzzle(words: JapaneseWord[], level: string, script: Script): Puzzle {
    // hiragana and katakana words never share a character, so they can't cross: "both" picks one of them by chance
    const katakana = script === "both" ? Math.random() < 0.5 : script === "katakana";
    const inScript = words.filter((word) => isKatakanaWord(word.w) === katakana);
    const pool = wordsUpTo(inScript, level, MAX_WORD_LENGTH);
    const crossword = bestCrossword(pool, WORD_COUNT, MAX_SIZE, 6, Math.random, recentWords.recent());
    recentWords.remember(crossword.entries.map((entry) => entry.word), pool.length);
    return {
        id: nextPuzzleId++,
        crossword,
        script: katakana ? "katakana" : "hiragana",
        level,
    };
}
