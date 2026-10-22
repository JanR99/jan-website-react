import { LEVELS as STAT_LEVELS } from "./crossword/puzzles";
import { hitRate } from "../../utils/gameStats";
import "../../styles/Games.css";


const ROWS: { label: string; value: (entry: KanjiLevelStats) => string }[] = [
    { label: "Runden", value: (entry) => String(entry.rounds) },
    { label: "Perfekt", value: (entry) => String(entry.perfectRounds) },
    { label: "Richtig", value: (entry) => `${entry.rightWords} / ${entry.askedWords}` },
    { label: "Quote", value: (entry) => hitRate(entry.rightWords, entry.askedWords) },
];

/** What the logged-in user has achieved in "Kanji lesen", in total and per level. */
export default function KanjiStatsTable({ stats, title }: { stats: KanjiStats; title: string }) {
    const cell = (level: string) => stats.levels.find((entry) => entry.level === level);

    return (
        <section className="game-stats card card-pad">
            <h2>{title}</h2>
            <dl className="game-stats-totals">
                <div><dt>Runden</dt><dd>{stats.rounds}</dd></div>
                <div><dt>Wörter richtig</dt><dd>{hitRate(stats.rightWords, stats.askedWords)}</dd></div>
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
                            {ROWS.map(({ label, value }) => (
                                <tr key={label}>
                                    <th scope="row">{label}</th>
                                    {STAT_LEVELS.map((level) => {
                                        const entry = cell(level);
                                        return <td key={level}>{entry ? value(entry) : <span className="muted">–</span>}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="muted game-stats-hint">
                        Je Niveau: gespielte Runden, Runden ohne Fehler, richtige von allen Wörtern und die Quote.
                        Die Serie zählt richtige Wörter in Folge, über Runden hinweg.
                    </p>
                </div>
            )}
        </section>
    );
}
