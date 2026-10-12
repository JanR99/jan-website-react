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
