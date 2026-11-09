import { shuffle } from "../../../utils/chance";
import { ROUND_LENGTH, vocabRound, type VocabWord } from "../../../utils/vocab";

export interface Round {
    id: number;
    words: VocabWord[];
    level: string;
    /** a round of the own mistakes: it changes only the list of mistakes */
    practice: boolean;
}

let nextRoundId = 1;

/** Ten words of the level, the due ones first (see vocabRound). */
export function newRound(words: VocabWord[], cards: VocabCard[], level: string): Round {
    return { id: nextRoundId++, words: vocabRound(words, cards, Date.now()), level, practice: false };
}

/** Up to ten of the own mistakes, most often wrong first, asked with the reading and meaning stored with them. */
export function practiceRound(mistakes: VocabMistake[], level: string): Round {
    const words = mistakes.slice(0, ROUND_LENGTH).map((mistake) => ({ word: mistake.word, reading: mistake.reading, meaning: mistake.meaning, level }));
    return { id: nextRoundId++, words: shuffle(words), level, practice: true };
}
