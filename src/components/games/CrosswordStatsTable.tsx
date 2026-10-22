import { LEVELS as STAT_LEVELS } from "./crossword/puzzles";
import "../../styles/Games.css";

const STAT_SCRIPTS: { script: CrosswordScript; label: string }[] = [
    { script: "hiragana", label: "Hiragana" },
    { script: "katakana", label: "Katakana" },
];

/** What the logged-in user has achieved in the crossword, in total and per script and level. */
export default function CrosswordStatsTable({ stats, title }: { stats: CrosswordStats; title: string }) {
    const cell = (script: CrosswordScript, level: string) =>
        stats.levels.find((entry) => entry.script === script && entry.level === level);

    return (
        <section className="game-stats card card-pad">
            <h2>{title}</h2>
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
