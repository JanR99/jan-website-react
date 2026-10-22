import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { GAMES_BASE } from "./paths";

/**
 * The own numbers in one line above a game, with the streak and a link to all numbers.
 * Guests are asked to log in instead; while the numbers load, the line stays empty.
 */
export default function GameStatsLine<Stats extends { currentStreak: number; bestStreak: number }>({ loggedIn, counted, stats, summary }: {
    loggedIn: boolean;
    /** what is counted once logged in, like "deine Runden" */
    counted: string;
    stats: Stats | null;
    /** the numbers before the streak, like "3 Runden · 80 % richtig" */
    summary: (stats: Stats) => string;
}) {
    const { openAuthDialog } = useAuth();
    return (
        <p className="crossword-stats muted">
            {!loggedIn ? (
                <span>
                    <button type="button" className="crossword-stats-login" onClick={() => openAuthDialog("login")}>Melde dich an</button>,
                    damit {counted} gezählt werden.
                </span>
            ) : stats && (
                <>
                    <Trophy size={15} /> {summary(stats)} ·
                    Serie {stats.currentStreak} (beste {stats.bestStreak}) · <Link to={GAMES_BASE}>mehr</Link>
                </>
            )}
        </p>
    );
}
