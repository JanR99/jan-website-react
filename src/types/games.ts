export type CrosswordScript = "hiragana" | "katakana";

/** The numbers of one script and level; only the ones played so far are listed. */
export interface CrosswordLevelStats {
    script: CrosswordScript;
    level: string;
    solved: number;
    words: number;
}

/** What the logged-in user has achieved in the crossword. */
export interface CrosswordStats {
    /** crosswords solved without help ("Feld aufdecken" or "Lösung zeigen") */
    solved: number;
    /** words got right without having them shown */
    words: number;
    /** crosswords solved in a row */
    currentStreak: number;
    bestStreak: number;
    levels: CrosswordLevelStats[];
}

/** The end of a crossword: solved without help, or finished with "Feld aufdecken" or "Lösung zeigen". */
export interface CrosswordResult {
    script: CrosswordScript;
    level: string;
    solved: boolean;
    rightWords: number;
}

/** The numbers of one level of "Kanji lesen"; only the levels played so far are listed. */
export interface KanjiLevelStats {
    level: string;
    rounds: number;
    perfectRounds: number;
    rightWords: number;
    askedWords: number;
}

/** What the logged-in user has achieved in "Kanji lesen". */
export interface KanjiStats {
    /** rounds played to the end */
    rounds: number;
    /** rounds with every word right */
    perfectRounds: number;
    rightWords: number;
    askedWords: number;
    /** words read right in a row, across rounds */
    currentStreak: number;
    bestStreak: number;
    levels: KanjiLevelStats[];
}

/** A word of a round of "Kanji lesen", as the game showed it. */
export interface KanjiResultWord {
    word: string;
    reading: string;
    meaning: string;
}

/**
 * The end of a round of "Kanji lesen": for each word, in order, whether it was read right.
 * A round of mistakes (practice) changes only the list of mistakes, not the numbers, and needs no level.
 */
export interface KanjiResult {
    level?: string;
    answers: boolean[];
    words?: KanjiResultWord[];
    practice?: boolean;
}

/** A word read wrong and not yet read right twice in a row since; the list comes most often wrong first. */
export interface KanjiMistake {
    word: string;
    reading: string;
    meaning: string;
    /** how often it was read wrong */
    wrong: number;
    /** how often it was read right since the last time it was wrong; at 2 it leaves the list */
    rightInRow: number;
}

/** The numbers of one script in "Kana lesen"; only the scripts asked so far are listed. */
export interface KanaScriptStats {
    script: "hiragana" | "katakana";
    rightKana: number;
    askedKana: number;
}

/** What the logged-in user has achieved in "Kana lesen". */
export interface KanaStats {
    /** rounds played to the end */
    rounds: number;
    /** rounds with every character right */
    perfectRounds: number;
    rightKana: number;
    askedKana: number;
    /** characters read right in a row, across rounds */
    currentStreak: number;
    bestStreak: number;
    scripts: KanaScriptStats[];
}

/**
 * The end of a round of "Kana lesen": the characters and, in the same order, whether each was read right.
 * A round of mistakes (practice) changes only the list of mistakes, not the numbers.
 */
export interface KanaResult {
    answers: boolean[];
    kana: string[];
    practice?: boolean;
}

/** A character read wrong and not yet read right twice in a row since; the list comes most often wrong first. */
export interface KanaMistake {
    kana: string;
    /** how often it was read wrong */
    wrong: number;
    /** how often it was read right since the last time it was wrong; at 2 it leaves the list */
    rightInRow: number;
}
