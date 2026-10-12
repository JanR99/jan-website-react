import { Link } from "react-router-dom";
import { ArrowRight, Grid3x3 } from "lucide-react";
import { useCrosswordStats } from "../../hooks/useCrosswordStats";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { CrosswordScript, CrosswordStats } from "../../types/games";
import PageHeader from "../layout/PageHeader";
import { CROSSWORD_PATH } from "./paths";
import "../../styles/Games.css";

/** The overview of the small games; for now there is the Japanese crossword. */
export default function GamesPage() {
    usePageTitle("Spiele");
    const { stats, loggedIn } = useCrosswordStats();

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
            </div>

            {loggedIn && stats && <CrosswordStatsTable stats={stats} />}
        </div>
    );
}

const STAT_LEVELS = ["A1", "A2", "B1", "B2", "C1"];
const STAT_SCRIPTS: { script: CrosswordScript; label: string }[] = [
    { script: "hiragana", label: "Hiragana" },
    { script: "katakana", label: "Katakana" },
];

/** What the logged-in user has achieved in the crossword, in total and per script and level. */
function CrosswordStatsTable({ stats }: { stats: CrosswordStats }) {
    const cell = (script: CrosswordScript, level: string) =>
        stats.levels.find((entry) => entry.script === script && entry.level === level);

    return (
        <section className="game-stats card card-pad">
            <h2>Deine Bilanz im Kreuzworträtsel</h2>
            <dl className="game-stats-totals">
                <div><dt>Rätsel gelöst</dt><dd>{stats.solved}</dd></div>
                <div><dt>Wörter richtig</dt><dd>{stats.words}</dd></div>
                <div><dt>Serie</dt><dd>{stats.currentStreak}</dd></div>
                <div><dt>Beste Serie</dt><dd>{stats.bestStreak}</dd></div>
            </dl>
            {stats.levels.length > 0 && (
                <div className="game-stats-scroll">
                    <table className="game-stats-table">
                        <thead>
                            <tr>
                                <th />
                                {STAT_LEVELS.map((level) => <th key={level} scope="col">{level}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {STAT_SCRIPTS.map(({ script, label }) => (
                                <tr key={script}>
                                    <th scope="row">{label}</th>
                                    {STAT_LEVELS.map((level) => {
                                        const entry = cell(script, level);
                                        return (
                                            <td key={level}>
                                                {entry ? <><strong>{entry.solved}</strong><span className="muted"> / {entry.words} W.</span></> : <span className="muted">–</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="muted game-stats-hint">Gelöste Rätsel / richtige Wörter (W.) je Schrift und Niveau.</p>
                </div>
            )}
        </section>
    );
}
