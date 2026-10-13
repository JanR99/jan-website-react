import { useEffect, useState } from "react";
import { useAuth } from "../components/auth/AuthContext";
import GamesController from "../controller/GamesController";
import type { KanjiMistake } from "../types/games";

/**
 * The "Kanji lesen" mistakes of the logged-in user, most often wrong first; null for guests, while loading
 * and when loading failed (then `failed` is set). `reload` fetches the list again and keeps showing the old one
 * meanwhile, `remove` takes a word off the list.
 */
export function useKanjiMistakes() {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [loaded, setLoaded] = useState<{ userId: number; mistakes: KanjiMistake[] | null } | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (userId === null) return;
        let active = true;
        GamesController.getKanjiMistakes()
            .then((mistakes) => active && setLoaded({ userId, mistakes }))
            .catch((error) => {
                console.error("Error loading kanji mistakes:", error);
                if (active) setLoaded({ userId, mistakes: null });
            });
        return () => {
            active = false;
        };
    }, [userId, attempt]);

    const reload = () => setAttempt((current) => current + 1);

    const remove = (word: string) => {
        if (userId === null) return;
        GamesController.deleteKanjiMistake(word)
            .then((mistakes) => setLoaded({ userId, mistakes }))
            .catch((error) => console.error("Error deleting kanji mistake:", error));
    };

    // the list of a user who has logged out since doesn't count
    const current = loaded && loaded.userId === userId ? loaded : null;
    return { mistakes: current?.mistakes ?? null, failed: current !== null && current.mistakes === null, reload, remove };
}
