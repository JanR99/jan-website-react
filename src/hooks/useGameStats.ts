import { useEffect, useState } from "react";
import { useAuth } from "../components/auth/AuthContext";
import GamesController from "../controller/GamesController";

/**
 * The numbers of the logged-in user in a game, null for guests, while loading and when loading failed
 * (then `failed` is set and `reload` tries again).
 * `record` counts a finished game; guests' games aren't counted.
 */
function useGameStats<Stats, Result>(load: () => Promise<Stats>, save: (result: Result) => Promise<Stats>, name: string) {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [loaded, setLoaded] = useState<{ userId: number; stats: Stats | null } | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (userId === null) return;
        let active = true;
        load()
            .then((stats) => active && setLoaded({ userId, stats }))
            .catch((error) => {
                console.error(`Error loading ${name} stats:`, error);
                if (active) setLoaded({ userId, stats: null });
            });
        return () => {
            active = false;
        };
    }, [userId, attempt, load, name]);

    const reload = () => {
        setLoaded(null);
        setAttempt((current) => current + 1);
    };

    /** resolves once the result is saved (or saving failed), so what depends on it can be loaded again */
    const record = (result: Result): Promise<void> => {
        if (userId === null) return Promise.resolve();
        return save(result)
            .then((stats) => setLoaded({ userId, stats }))
            .catch((error) => console.error(`Error saving ${name} result:`, error));
    };

    // numbers of a user who has logged out since don't count
    const current = loaded && loaded.userId === userId ? loaded : null;
    return { stats: current?.stats ?? null, failed: current !== null && current.stats === null, loggedIn: userId !== null, record, reload };
}

/** The crossword numbers of the logged-in user. */
export const useCrosswordStats = () =>
    useGameStats<CrosswordStats, CrosswordResult>(GamesController.getCrosswordStats, GamesController.recordCrosswordResult, "crossword");

/** The "Kanji lesen" numbers of the logged-in user. */
export const useKanjiStats = () =>
    useGameStats<KanjiStats, KanjiResult>(GamesController.getKanjiStats, GamesController.recordKanjiResult, "kanji");

/** The "Kana lesen" numbers of the logged-in user. */
export const useKanaStats = () =>
    useGameStats<KanaStats, KanaResult>(GamesController.getKanaStats, GamesController.recordKanaResult, "kana");
