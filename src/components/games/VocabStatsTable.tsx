import { hitRate } from "../../utils/gameStats";
import "../../styles/Games.css";

/** What the logged-in user has achieved in "Vokabeln": the numbers in total and how many words sit per level. */
export default function VocabStatsTable({ stats, title }: { stats: VocabStats; title: string }) {
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
                                {stats.levels.map(({ level }) => <th key={level} scope="col">{level}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row">Gelernt</th>
                                {stats.levels.map(({ level, words }) => <td key={level}>{words}</td>)}
                            </tr>
                            <tr>
                                <th scope="row">Sitzen</th>
                                {stats.levels.map(({ level, learned }) => <td key={level}>{learned}</td>)}
                            </tr>
                        </tbody>
                    </table>
                    <p className="muted game-stats-hint">
                        Je Niveau: Wörter, die du schon hattest, und davon die, die sitzen. Ein Wort sitzt, wenn du es
                        so oft in Folge richtig hattest, dass es erst nach 16 Tagen oder später wiederkommt.
                    </p>
                </div>
            )}
        </section>
    );
}
