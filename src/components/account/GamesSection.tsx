import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { useCrosswordStats, useKanaStats, useKanjiStats } from "../../hooks/useGameStats";
import { useKanaMistakes, useKanjiMistakes } from "../../hooks/useGameMistakes";
import CrosswordStatsTable from "../games/CrosswordStatsTable";
import KanaMistakesList from "../games/KanaMistakesList";
import KanaStatsTable from "../games/KanaStatsTable";
import KanjiMistakesList from "../games/KanjiMistakesList";
import KanjiStatsTable from "../games/KanjiStatsTable";
import { CROSSWORD_PATH, KANA_PATH, KANJI_PATH } from "../games/paths";
import LoadError from "../ui/LoadError";

/** The account's numbers in the games; a game shows up once it has been played. */
export default function GamesSection() {
    const crossword = useCrosswordStats();
    const kanji = useKanjiStats();
    const kanjiMistakes = useKanjiMistakes();
    const kana = useKanaStats();
    const kanaMistakes = useKanaMistakes();

    if (crossword.failed || kanji.failed || kanjiMistakes.failed || kana.failed || kanaMistakes.failed) {
        const retry = () => {
            if (crossword.failed) crossword.reload();
            if (kanji.failed) kanji.reload();
            if (kanjiMistakes.failed) kanjiMistakes.reload();
            if (kana.failed) kana.reload();
            if (kanaMistakes.failed) kanaMistakes.reload();
        };
        return <LoadError message="Deine Bilanz konnte nicht geladen werden." onRetry={retry} />;
    }

    if (!crossword.stats || !kanji.stats || !kanjiMistakes.mistakes || !kana.stats || !kanaMistakes.mistakes) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    const playedCrossword = crossword.stats.solved > 0 || crossword.stats.words > 0;
    const playedKanji = kanji.stats.rounds > 0 || kanjiMistakes.mistakes.length > 0;
    const playedKana = kana.stats.rounds > 0 || kanaMistakes.mistakes.length > 0;

    if (!playedCrossword && !playedKanji && !playedKana) {
        return (
            <div className="card empty-state">
                <span className="empty-state-icon"><Gamepad2 size={26} /></span>
                <h3>Noch nichts gespielt</h3>
                <p>Spiel ein Kreuzworträtsel oder eine Runde „Kana lesen“ oder „Kanji lesen“, dann siehst du hier deine Bilanz.</p>
                <p className="account-games-play">
                    <Link to={CROSSWORD_PATH} className="btn">Zum Kreuzworträtsel</Link>
                    <Link to={KANA_PATH} className="btn btn-secondary">Zu „Kana lesen“</Link>
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
            {playedKana && (
                <>
                    <KanaStatsTable stats={kana.stats} title="Kana lesen" />
                    {kanaMistakes.mistakes.length > 0 && (
                        <KanaMistakesList mistakes={kanaMistakes.mistakes} onRemove={kanaMistakes.remove} />
                    )}
                    <p className="account-games-play">
                        <Link to={KANA_PATH} className="btn">Weiterspielen</Link>
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
