import { Link } from "react-router-dom";
import { Grid3x3 } from "lucide-react";
import { useCrosswordStats } from "../../hooks/useCrosswordStats";
import CrosswordStatsTable from "../games/CrosswordStatsTable";
import { CROSSWORD_PATH } from "../games/paths";
import LoadError from "../ui/LoadError";

/** The account's numbers in the games, for now the crossword. */
export default function GamesSection() {
    const { stats, failed, reload } = useCrosswordStats();

    if (failed) {
        return <LoadError message="Deine Bilanz konnte nicht geladen werden." onRetry={reload} />;
    }

    if (!stats) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    if (stats.solved === 0 && stats.words === 0) {
        return (
            <div className="card empty-state">
                <span className="empty-state-icon"><Grid3x3 size={26} /></span>
                <h3>Noch nichts gespielt</h3>
                <p>Löse ein Kreuzworträtsel, dann siehst du hier deine Bilanz.</p>
                <Link to={CROSSWORD_PATH} className="btn">Zum Kreuzworträtsel</Link>
            </div>
        );
    }

    return (
        <>
            <CrosswordStatsTable stats={stats} title="Kreuzworträtsel" />
            <p className="account-games-play">
                <Link to={CROSSWORD_PATH} className="btn">Weiterspielen</Link>
            </p>
        </>
    );
}
