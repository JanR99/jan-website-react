import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleHelp, RefreshCw, RotateCcw, Trophy } from "lucide-react";
import { useKanaStats } from "../../../hooks/useGameStats";
import { useKanaMistakes } from "../../../hooks/useGameMistakes";
import { KANA_GROUPS, newKanaRound, practiceKanaRound, type KanaGroup } from "../../../utils/kanaQuiz";
import { useAuth } from "../../auth/AuthContext";
import { SCRIPTS, type Script } from "../crossword/puzzles";
import { hitRate } from "../KanjiStatsTable";
import { GAMES_BASE, PRACTICE_PARAM } from "../paths";
import KanaRound from "./KanaRound";

/** Script, groups of characters and the current round with the own numbers above it; a change starts a new round. */
export default function KanaSetup() {
    const [script, setScript] = useState<Script>("hiragana");
    const [groups, setGroups] = useState<KanaGroup[]>(["basic"]);
    const [round, setRound] = useState(() => newKanaRound(groups, script));
    const { stats, loggedIn, record } = useKanaStats();
    const { mistakes, reload: reloadMistakes } = useKanaMistakes();
    const { openAuthDialog } = useAuth();
    const [searchParams] = useSearchParams();
    // coming with ?fehler (from the account): a round of mistakes, as soon as the list is there
    const [wantsPractice, setWantsPractice] = useState(() => searchParams.has(PRACTICE_PARAM));
    const mistakeCount = mistakes?.length ?? 0;

    const start = (nextScript: Script, nextGroups: KanaGroup[]) => {
        setScript(nextScript);
        setGroups(nextGroups);
        setRound(newKanaRound(nextGroups, nextScript));
    };

    // at least one group stays on
    const toggleGroup = (group: KanaGroup) => {
        const next = groups.includes(group) ? groups.filter((g) => g !== group) : [...groups, group];
        if (next.length > 0) start(script, next);
    };

    const practice = () => {
        if (mistakes && mistakes.length > 0) setRound(practiceKanaRound(mistakes.map((mistake) => mistake.kana)));
        else start(script, groups);
    };

    if (wantsPractice && mistakes !== null) {
        setWantsPractice(false);
        if (mistakes.length > 0) setRound(practiceKanaRound(mistakes.map((mistake) => mistake.kana)));
    }

    const finish = (answers: boolean[]) => {
        void record({ answers, kana: round.kana, practice: round.practice }).then(reloadMistakes);
    };

    return (
        <>
            <div className="crossword-toolbar">
                <div className="segmented" role="group" aria-label="Schrift">
                    {SCRIPTS.map(({ value, label }) => (
                        <button key={value} type="button" aria-pressed={!round.practice && script === value} onClick={() => start(value, groups)}>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="crossword-level">
                    <span className="muted" id="kana-groups-label">Zeichen</span>
                    <div className="segmented" role="group" aria-labelledby="kana-groups-label">
                        {KANA_GROUPS.map(({ value, label }) => (
                            <button key={value} type="button" aria-pressed={!round.practice && groups.includes(value)} onClick={() => toggleGroup(value)}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => start(script, groups)}>
                    <RefreshCw size={16} /> Neue Runde
                </button>
                {mistakeCount > 0 && (
                    <button type="button" className="btn btn-secondary btn-sm" aria-pressed={round.practice} onClick={practice}>
                        <RotateCcw size={16} /> Meine Fehler ({mistakeCount})
                    </button>
                )}
                <details className="crossword-help">
                    <summary><CircleHelp size={16} /> So geht's</summary>
                    <p>
                        Tippe, wie das Zeichen gelesen wird, zum Beispiel „ka“ für か oder „kya“ für きゃ, und drücke Enter.
                        Groß- und Kleinschreibung sind egal, andere Schreibweisen gehen auch („si“ für し, „tu“ für つ,
                        „nn“ für ん), ebenso ぢ und づ als „ji“ und „zu“. Eine Runde hat zehn Zeichen.
                    </p>
                    <p>
                        Unter „Zeichen“ wählst du, was abgefragt wird: die Grundzeichen, die mit ゛ und ゜ (が, ぱ …)
                        und die Kombinationen (きゃ, しゅ …), auch mehrere zusammen.
                    </p>
                    <p>
                        Angemeldet kommen falsch gelesene Zeichen auf deine Fehlerliste; „Meine Fehler“ fragt sie ab.
                        Zweimal in Folge richtig, und ein Zeichen ist wieder runter.
                    </p>
                </details>
            </div>
            <p className="crossword-stats muted">
                {!loggedIn ? (
                    <span>
                        <button type="button" className="crossword-stats-login" onClick={() => openAuthDialog("login")}>Melde dich an</button>,
                        damit deine Runden gezählt werden.
                    </span>
                ) : stats && (
                    <>
                        <Trophy size={15} /> {stats.rounds} {stats.rounds === 1 ? "Runde" : "Runden"} · {hitRate(stats.rightKana, stats.askedKana)} richtig ·
                        Serie {stats.currentStreak} (beste {stats.bestStreak}) · <Link to={GAMES_BASE}>mehr</Link>
                    </>
                )}
            </p>
            {round.kana.length === 0 ? (
                <div className="card empty-state"><p>Für diese Auswahl gibt es keine Zeichen.</p></div>
            ) : (
                <KanaRound
                    key={round.id}
                    kana={round.kana}
                    practice={round.practice}
                    newLabel={round.practice && mistakeCount > 0 ? `Weiter üben (${mistakeCount})` : "Neue Runde"}
                    onNew={round.practice ? practice : () => start(script, groups)}
                    onFinished={finish}
                />
            )}
        </>
    );
}
