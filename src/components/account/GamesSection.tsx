import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { useCrosswordStats, useKanjiStats } from "../../hooks/useGameStats";
import { useKanjiMistakes } from "../../hooks/useKanjiMistakes";
import CrosswordStatsTable from "../games/CrosswordStatsTable";
import KanjiMistakesList from "../games/KanjiMistakesList";
import KanjiStatsTable from "../games/KanjiStatsTable";
import { CROSSWORD_PATH, KANJI_PATH } from "../games/paths";
import LoadError from "../ui/LoadError";

/** The account's numbers in the games; a game shows up once it has been played. */
export default function GamesSection() {
    const crossword = useCrosswordStats();
    const kanji = useKanjiStats();
    const kanjiMistakes = useKanjiMistakes();

    if (crossword.failed || kanji.failed || kanjiMistakes.failed) {
        const retry = () => {
            if (crossword.failed) crossword.reload();
            if (kanji.failed) kanji.reload();
            if (kanjiMistakes.failed) kanjiMistakes.reload();
        };
        return <LoadError message="Deine Bilanz konnte nicht geladen werden." onRetry={retry} />;
    }

    if (!crossword.stats || !kanji.stats || !kanjiMistakes.mistakes) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    const playedCrossword = crossword.stats.solved > 0 || crossword.stats.words > 0;
    const playedKanji = kanji.stats.rounds > 0 || kanjiMistakes.mistakes.length > 0;

    if (!playedCrossword && !playedKanji) {
        return (
            <div className="card empty-state">
                <span className="empty-state-icon"><Gamepad2 size={26} /></span>
                <h3>Noch nichts gespielt</h3>
                <p>Spiel ein Kreuzworträtsel oder eine Runde „Kanji lesen“, dann siehst du hier deine Bilanz.</p>
                <p className="account-games-play">
                    <Link to={CROSSWORD_PATH} className="btn">Zum Kreuzworträtsel</Link>
                    <Link to={KANJI_PATH} className="btn btn-secondary">Zu „Kanji lesen“</Link>
                </p>
            </div>
        );
    }

    return (
        <>
            {playedCrossword && (
                <>
                    <CrosswordStatsTable stats={crossword.stats} title="Kreuzworträtsel" />
                    <p className="account-games-play">
                        <Link to={CROSSWORD_PATH} className="btn">Weiterspielen</Link>
                    </p>
                </>
            )}
            {playedKanji && (
                <>
                    <KanjiStatsTable stats={kanji.stats} title="Kanji lesen" />
                    {kanjiMistakes.mistakes.length > 0 && (
                        <KanjiMistakesList mistakes={kanjiMistakes.mistakes} onRemove={kanjiMistakes.remove} />
                    )}
                    <p className="account-games-play">
                        <Link to={KANJI_PATH} className="btn">Weiterspielen</Link>
                    </p>
                </>
            )}
        </>
    );
}
