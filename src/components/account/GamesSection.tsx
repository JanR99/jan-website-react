import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { useCrosswordStats, useKanaStats, useKanjiStats } from "../../hooks/useGameStats";
import { useKanaMistakes, useKanjiMistakes } from "../../hooks/useGameMistakes";
import CrosswordStatsTable from "../games/CrosswordStatsTable";
import KanaStatsTable from "../games/KanaStatsTable";
import KanjiStatsTable from "../games/KanjiStatsTable";
import MistakesList from "../games/MistakesList";
import { CROSSWORD_PATH, KANA_PATH, KANA_PRACTICE_PATH, KANJI_PATH, KANJI_PRACTICE_PATH } from "../games/paths";
import { kanaItem, kanjiItem } from "../games/readingItems";
import LoadError from "../ui/LoadError";
import Spinner from "../ui/Spinner";

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
        return <Spinner />;
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
                        <MistakesList
                            mistakes={kanaMistakes.mistakes.map(({ kana, wrong, rightInRow }) => ({ ...kanaItem(kana), wrong, rightInRow }))}
                            intro="Zeichen, die du falsch gelesen hast. Zweimal in Folge richtig, und ein Zeichen ist wieder runter."
                            practicePath={KANA_PRACTICE_PATH}
                            onRemove={kanaMistakes.remove}
                        />
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
                        <MistakesList
                            mistakes={kanjiMistakes.mistakes.map(({ word, reading, meaning, wrong, rightInRow }) => ({
                                ...kanjiItem({ k: word, r: reading, en: meaning }),
                                wrong,
                                rightInRow,
                            }))}
                            intro="Wörter, die du falsch gelesen hast. Zweimal in Folge richtig, und ein Wort ist wieder runter."
                            practicePath={KANJI_PRACTICE_PATH}
                            onRemove={kanjiMistakes.remove}
                        />
                    )}
                    <p className="account-games-play">
                        <Link to={KANJI_PATH} className="btn">Weiterspielen</Link>
                    </p>
                </>
            )}
        </>
    );
}
