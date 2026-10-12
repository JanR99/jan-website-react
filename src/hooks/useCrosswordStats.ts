import { useEffect, useState } from "react";
import { useAuth } from "../components/auth/AuthContext";
import GamesController from "../controller/GamesController";
import type { CrosswordResult, CrosswordStats } from "../types/games";

/**
 * The crossword numbers of the logged-in user, null for guests, while loading and when loading failed
 * (then `failed` is set and `reload` tries again).
 * `record` counts a finished crossword; guests' crosswords aren't counted.
 */
export function useCrosswordStats() {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [loaded, setLoaded] = useState<{ userId: number; stats: CrosswordStats | null } | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (userId === null) return;
        let active = true;
        GamesController.getCrosswordStats()
            .then((stats) => active && setLoaded({ userId, stats }))
            .catch((error) => {
                console.error("Error loading crossword stats:", error);
                if (active) setLoaded({ userId, stats: null });
            });
        return () => {
            active = false;
        };
    }, [userId, attempt]);

    const reload = () => {
        setLoaded(null);
        setAttempt((current) => current + 1);
    };

    const record = (result: CrosswordResult) => {
        if (userId === null) return;
        GamesController.recordCrosswordResult(result)
            .then((stats) => setLoaded({ userId, stats }))
            .catch((error) => console.error("Error saving crossword result:", error));
    };

    // numbers of a user who has logged out since don't count
    const current = loaded && loaded.userId === userId ? loaded : null;
    return { stats: current?.stats ?? null, failed: current !== null && current.stats === null, loggedIn: userId !== null, record, reload };
}
