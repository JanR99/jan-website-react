import { Link } from "react-router-dom";
import { ArrowRight, Grid3x3, Languages } from "lucide-react";
import { useCrosswordStats, useKanjiStats } from "../../hooks/useGameStats";
import { usePageTitle } from "../../hooks/usePageTitle";
import PageHeader from "../layout/PageHeader";
import CrosswordStatsTable from "./CrosswordStatsTable";
import KanjiStatsTable from "./KanjiStatsTable";
import { CROSSWORD_PATH, KANJI_PATH } from "./paths";
import "../../styles/Games.css";

/** The overview of the small games: the Japanese crossword and the kanji readings. */
export default function GamesPage() {
    usePageTitle("Spiele");
    const { stats, loggedIn } = useCrosswordStats();
    const { stats: kanjiStats } = useKanjiStats();

    return (
        <div className="container">
            <PageHeader eyebrow="Spielen & Lernen" title="Spiele" lead="Kleine Spiele zum Japanisch-Lernen." />

            <div className="games-grid">
                <Link to={CROSSWORD_PATH} className="game-card card">
                    <span className="game-card-icon"><Grid3x3 size={26} /></span>
                    <strong>Kreuzworträtsel</strong>
                    <span className="muted">Japanische Wörter in Hiragana und Katakana zu englischen Hinweisen.</span>
                    <span className="game-card-cta">Spielen <ArrowRight size={16} /></span>
                </Link>
                <Link to={KANJI_PATH} className="game-card card">
                    <span className="game-card-icon"><Languages size={26} /></span>
                    <strong>Kanji lesen</strong>
                    <span className="muted">Wörter in Kanji mit ihrer englischen Bedeutung: Tippe die Lesung in Romaji.</span>
                    <span className="game-card-cta">Spielen <ArrowRight size={16} /></span>
                </Link>
            </div>

            {loggedIn && stats && <CrosswordStatsTable stats={stats} title="Deine Bilanz im Kreuzworträtsel" />}
            {loggedIn && kanjiStats && <KanjiStatsTable stats={kanjiStats} title="Deine Bilanz in „Kanji lesen“" />}
        </div>
    );
}
