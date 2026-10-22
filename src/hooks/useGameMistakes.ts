import { useEffect, useState } from "react";
import { useAuth } from "../components/auth/AuthContext";
import GamesController from "../controller/GamesController";
import type { KanaMistake, KanjiMistake } from "../types/games";

/**
 * The mistakes of the logged-in user in a game, most often wrong first; null for guests, while loading
 * and when loading failed (then `failed` is set). `reload` fetches the list again and keeps showing the old one
 * meanwhile, `remove` takes an entry off the list.
 */
function useGameMistakes<Mistake>(load: () => Promise<Mistake[]>, remove: (key: string) => Promise<Mistake[]>, name: string) {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [loaded, setLoaded] = useState<{ userId: number; mistakes: Mistake[] | null } | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (userId === null) return;
        let active = true;
        load()
            .then((mistakes) => active && setLoaded({ userId, mistakes }))
            .catch((error) => {
                console.error(`Error loading ${name} mistakes:`, error);
                if (active) setLoaded({ userId, mistakes: null });
            });
        return () => {
            active = false;
        };
    }, [userId, attempt, load, name]);

    const reload = () => setAttempt((current) => current + 1);

    const removeMistake = (key: string) => {
        if (userId === null) return;
        remove(key)
            .then((mistakes) => setLoaded({ userId, mistakes }))
            .catch((error) => console.error(`Error deleting ${name} mistake:`, error));
    };

    // the list of a user who has logged out since doesn't count
    const current = loaded && loaded.userId === userId ? loaded : null;
    return { mistakes: current?.mistakes ?? null, failed: current !== null && current.mistakes === null, reload, remove: removeMistake };
}

/** The "Kana lesen" mistakes of the logged-in user; `remove` takes a character off the list. */
export const useKanaMistakes = () =>
    useGameMistakes<KanaMistake>(GamesController.getKanaMistakes, GamesController.deleteKanaMistake, "kana");

/** The "Kanji lesen" mistakes of the logged-in user; `remove` takes a word off the list. */
export const useKanjiMistakes = () =>
    useGameMistakes<KanjiMistake>(GamesController.getKanjiMistakes, GamesController.deleteKanjiMistake, "kanji");
