import { useEffect, useState } from "react";
import { useAuth } from "../components/auth/AuthContext";
import GamesController from "../controller/GamesController";
import type { CrosswordResult, CrosswordStats } from "../types/games";

/**
 * The crossword numbers of the logged-in user, null for guests and while loading.
 * `record` counts a finished crossword; guests' crosswords aren't counted.
 */
export function useCrosswordStats() {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [loaded, setLoaded] = useState<{ userId: number; stats: CrosswordStats } | null>(null);

    useEffect(() => {
        if (userId === null) return;
        let active = true;
        GamesController.getCrosswordStats()
            .then((stats) => active && setLoaded({ userId, stats }))
            .catch((error) => console.error("Error loading crossword stats:", error));
        return () => {
            active = false;
        };
    }, [userId]);

    const record = (result: CrosswordResult) => {
        if (userId === null) return;
        GamesController.recordCrosswordResult(result)
            .then((stats) => setLoaded({ userId, stats }))
            .catch((error) => console.error("Error saving crossword result:", error));
    };

    // numbers of a user who has logged out since don't count
    const stats = loaded && loaded.userId === userId ? loaded.stats : null;
    return { stats, loggedIn: userId !== null, record };
}
