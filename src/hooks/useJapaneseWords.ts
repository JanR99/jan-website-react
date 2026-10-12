import { useEffect, useState } from "react";
import type { JapaneseWord } from "../utils/crossword";

/** The word list from https://github.com/JanR99/japanese-practice, prepared as public/games/japanese-words.json. */
const WORDS_URL = "/games/japanese-words.json";

let loading: Promise<JapaneseWord[]> | null = null;

function loadWords(): Promise<JapaneseWord[]> {
    if (!loading) {
        loading = fetch(WORDS_URL)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json() as Promise<JapaneseWord[]>;
            })
            .catch((error) => {
                // the next try loads again
                loading = null;
                throw error;
            });
    }
    return loading;
}

/** The Japanese words for the games; loaded once, only when a game needs them. */
export function useJapaneseWords() {
    const [words, setWords] = useState<JapaneseWord[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let active = true;
        loadWords().then(
            (loaded) => active && setWords(loaded),
            () => active && setFailed(true),
        );
        return () => {
            active = false;
        };
    }, [attempt]);

    const retry = () => {
        setFailed(false);
        setAttempt((n) => n + 1);
    };

    return { words, failed, retry };
}
