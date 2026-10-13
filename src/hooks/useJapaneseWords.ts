import { useEffect, useState } from "react";
import type { JapaneseWord } from "../utils/crossword";
import type { KanjiWord } from "../utils/kanjiReading";

/**
 * The word lists from https://github.com/JanR99/japanese-practice, prepared by `npm run words`
 * as public/games/japanese-words.json (kana words) and public/games/japanese-kanji.json.
 */
const WORDS_URL = "/games/japanese-words.json";
const KANJI_URL = "/games/japanese-kanji.json";

const loading = new Map<string, Promise<unknown>>();

function loadList<T>(url: string): Promise<T[]> {
    let list = loading.get(url);
    if (!list) {
        list = fetch(url)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .catch((error) => {
                // the next try loads again
                loading.delete(url);
                throw error;
            });
        loading.set(url, list);
    }
    return list as Promise<T[]>;
}

/** A word list for the games; loaded once, only when a game needs it. */
function useGameList<T>(url: string) {
    const [words, setWords] = useState<T[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let active = true;
        loadList<T>(url).then(
            (loaded) => active && setWords(loaded),
            () => active && setFailed(true),
        );
        return () => {
            active = false;
        };
    }, [url, attempt]);

    const retry = () => {
        setFailed(false);
        setAttempt((n) => n + 1);
    };

    return { words, failed, retry };
}

/** The kana words for the crossword. */
export const useJapaneseWords = () => useGameList<JapaneseWord>(WORDS_URL);

/** The kanji words with their readings for the kanji game. */
export const useJapaneseKanji = () => useGameList<KanjiWord>(KANJI_URL);
