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

/** The end of a round of "Kanji lesen": for each word, in order, whether it was read right. */
export interface KanjiResult {
    level: string;
    answers: boolean[];
}
