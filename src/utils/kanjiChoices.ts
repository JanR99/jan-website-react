import { shuffle } from "./chance";
import { KANJI, readingAsKana, type KanjiWord } from "./kanjiReading";

/** The kana of a word, with a placeholder for each kanji: 高い → "＊い", お金 → "お＊". */
const shape = (word: string) => [...word].map((char) => (KANJI.test(char) ? "＊" : char)).join("");

/**
 * Four words to choose from: the right one and three others that look alike, in a random order.
 * Look-alikes first share a kanji with the right word, then have the same shape (same kana in the same places),
 * then at least the same length. Words with the same reading or meaning are left out, so only one choice is right.
 */
export function kanjiChoices(word: KanjiWord, words: KanjiWord[], random = Math.random, count = 4): KanjiWord[] {
    const reading = readingAsKana(word.r);
    const kanji = new Set([...word.k].filter((char) => KANJI.test(char)));
    const wordShape = shape(word.k);
    // the reading is checked only for words that would be taken, as it is slow to work out for the whole list
    const fits = (other: KanjiWord) => other.k !== word.k && other.en !== word.en && KANJI.test(other.k);

    const shuffled = shuffle(words.filter(fits), random);
    const sharesKanji = (other: KanjiWord) => [...other.k].some((char) => kanji.has(char));
    const tiers = [
        shuffled.filter((other) => shape(other.k) === wordShape && sharesKanji(other)),
        shuffled.filter((other) => shape(other.k) === wordShape),
        shuffled.filter((other) => other.k.length === word.k.length),
        shuffled,
    ];

    const others: KanjiWord[] = [];
    for (const tier of tiers) {
        for (const other of tier) {
            if (others.length === count - 1) break;
            if (!others.includes(other) && readingAsKana(other.r) !== reading) others.push(other);
        }
    }
    return shuffle([word, ...others], random);
}
