import { Link } from "react-router-dom";
import { ArrowRight, Grid3x3, Languages, Trophy, Type } from "lucide-react";
import type { ReactNode } from "react";
import { ACCOUNT_BASE } from "../../config/navigation";
import { useCrosswordStats, useKanjiStats } from "../../hooks/useGameStats";
import { usePageTitle } from "../../hooks/usePageTitle";
import PageHeader from "../layout/PageHeader";
import { hitRate } from "./KanjiStatsTable";
import { CROSSWORD_PATH, KANA_PATH, KANJI_PATH } from "./paths";
import "../../styles/Games.css";

/** The overview of the small games: the Japanese crossword, the kana and the kanji readings, with the own numbers in short. */
export default function GamesPage() {
    usePageTitle("Spiele");
    const { stats: crossword, loggedIn } = useCrosswordStats();
    const { stats: kanji } = useKanjiStats();

    const crosswordLine = crossword && (
        crossword.solved > 0 || crossword.words > 0
            ? `${crossword.solved} gelöst · ${crossword.words} Wörter · Serie ${crossword.currentStreak}`
            : "Noch nicht gespielt"
    );
    const kanjiLine = kanji && (
        kanji.rounds > 0
            ? `${kanji.rounds} ${kanji.rounds === 1 ? "Runde" : "Runden"} · ${hitRate(kanji.rightWords, kanji.askedWords)} richtig · Serie ${kanji.currentStreak}`
            : "Noch nicht gespielt"
    );

    return (
        <div className="container">
            <PageHeader eyebrow="Spielen & Lernen" title="Spiele" lead="Kleine Spiele zum Japanisch-Lernen." />

            <div className="games-grid">
                <GameCard
                    to={CROSSWORD_PATH}
                    icon={<Grid3x3 size={26} />}
                    title="Kreuzworträtsel"
                    text="Japanische Wörter in Hiragana und Katakana zu englischen Hinweisen."
                    stats={loggedIn ? crosswordLine : null}
                />
                <GameCard
                    to={KANA_PATH}
                    icon={<Type size={26} />}
                    title="Kana lesen"
                    text="Einzelne Hiragana und Katakana: Tippe die Lesung in Romaji."
                    stats={null}
                />
                <GameCard
                    to={KANJI_PATH}
                    icon={<Languages size={26} />}
                    title="Kanji lesen"
                    text="Wörter in Kanji mit ihrer englischen Bedeutung: Tippe die Lesung in Romaji."
                    stats={loggedIn ? kanjiLine : null}
                />
            </div>

            {loggedIn && (
                <p className="games-stats-link">
                    <Link to={`${ACCOUNT_BASE}/spiele`}>Alle Zahlen im Konto <ArrowRight size={16} /></Link>
                </p>
            )}
        </div>
    );
}

function GameCard({ to, icon, title, text, stats }: {
    to: string;
    icon: ReactNode;
    title: string;
    text: string;
    /** the own numbers in one line; null for guests and while loading */
    stats: string | null;
}) {
    return (
        <Link to={to} className="game-card card">
            <span className="game-card-icon">{icon}</span>
            <strong>{title}</strong>
            <span className="muted">{text}</span>
            <span className="game-card-cta">Spielen <ArrowRight size={16} /></span>
            {stats && <span className="game-card-stats muted"><Trophy size={14} /> {stats}</span>}
        </Link>
    );
}
