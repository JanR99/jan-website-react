import type { KanaScriptStats, KanaStats } from "../../types/games";
import { hitRate } from "../../utils/gameStats";
import "../../styles/Games.css";

const STAT_SCRIPTS: { script: KanaScriptStats["script"]; label: string }[] = [
    { script: "hiragana", label: "Hiragana" },
    { script: "katakana", label: "Katakana" },
];

const ROWS: { label: string; value: (entry: KanaScriptStats) => string }[] = [
    { label: "Richtig", value: (entry) => `${entry.rightKana} / ${entry.askedKana}` },
    { label: "Quote", value: (entry) => hitRate(entry.rightKana, entry.askedKana) },
];

/** What the logged-in user has achieved in "Kana lesen", in total and per script. */
export default function KanaStatsTable({ stats, title }: { stats: KanaStats; title: string }) {
    const cell = (script: string) => stats.scripts.find((entry) => entry.script === script);

    return (
        <section className="game-stats card card-pad">
            <h2>{title}</h2>
            <dl className="game-stats-totals">
                <div><dt>Runden</dt><dd>{stats.rounds}</dd></div>
                <div><dt>Zeichen richtig</dt><dd>{hitRate(stats.rightKana, stats.askedKana)}</dd></div>
                <div><dt>Serie</dt><dd>{stats.currentStreak}</dd></div>
                <div><dt>Beste Serie</dt><dd>{stats.bestStreak}</dd></div>
            </dl>
            {stats.scripts.length > 0 && (
                <div className="game-stats-scroll">
                    <table className="game-stats-table">
                        <thead>
                            <tr>
                                <th />
                                {STAT_SCRIPTS.map(({ script, label }) => <th key={script} scope="col">{label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {ROWS.map(({ label, value }) => (
                                <tr key={label}>
                                    <th scope="row">{label}</th>
                                    {STAT_SCRIPTS.map(({ script }) => {
                                        const entry = cell(script);
                                        return <td key={script}>{entry ? value(entry) : <span className="muted">–</span>}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="muted game-stats-hint">
                        Je Schrift: richtige von allen gefragten Zeichen und die Quote. {stats.perfectRounds} von {stats.rounds}{" "}
                        Runden ohne Fehler. Die Serie zählt richtige Zeichen in Folge, über Runden hinweg.
                    </p>
                </div>
            )}
        </section>
    );
}
