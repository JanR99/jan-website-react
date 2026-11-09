import { kanaRomaji } from "../../utils/kanaQuiz";
import { readingAsKana, type KanjiWord } from "../../utils/kanjiReading";
import type { VocabWord } from "../../utils/vocab";

/** A character or word with its reading, as the results and the lists of mistakes show it. */
export interface ReadingItem {
    /** the character or word, like か or 本 */
    text: string;
    /** the reading in romaji (in hiragana for "Vokabeln") */
    reading: string;
    /** what the loudspeaker reads aloud */
    speak: string;
    /** the meaning, for words */
    meaning?: string;
}

/** A character of "Kana lesen". */
export const kanaItem = (kana: string): ReadingItem => ({ text: kana, reading: kanaRomaji(kana), speak: kana });

/** A word of "Vokabeln"; kana words have no reading of their own. */
export const vocabItem = (word: Pick<VocabWord, "word" | "reading" | "meaning">): ReadingItem => ({
    text: word.word,
    reading: word.reading,
    speak: word.reading || word.word,
    meaning: word.meaning,
});

/** A word of "Kanji lesen". */
export const kanjiItem = (word: Pick<KanjiWord, "k" | "r" | "en">): ReadingItem => ({
    text: word.k,
    reading: word.r.toLowerCase(),
    speak: readingAsKana(word.r),
    meaning: word.en,
});
