import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleHelp, RefreshCw, RotateCcw, Trophy } from "lucide-react";
import { useKanjiStats } from "../../../hooks/useGameStats";
import { useKanjiMistakes } from "../../../hooks/useKanjiMistakes";
import type { KanjiWord } from "../../../utils/kanjiReading";
import { useAuth } from "../../auth/AuthContext";
import { hitRate } from "../KanjiStatsTable";
import { GAMES_BASE, PRACTICE_PARAM } from "../paths";
import KanjiRound from "./KanjiRound";
import { LEVELS, MODES, newRound, practiceRound, wordsUpTo, type Mode } from "./rounds";

/** Mode, level and the current round with the own numbers above it; a new round starts fresh. */
export default function KanjiSetup({ words }: { words: KanjiWord[] }) {
    const [level, setLevel] = useState("A1");
    const [mode, setMode] = useState<Mode>("type");
    const [round, setRound] = useState(() => newRound(words, level, mode));
    const { stats, loggedIn, record } = useKanjiStats();
    const { mistakes, reload: reloadMistakes } = useKanjiMistakes();
    const { openAuthDialog } = useAuth();
    const [searchParams] = useSearchParams();
    // coming with ?fehler (from the account): a round of mistakes, as soon as the list is there
    const [wantsPractice, setWantsPractice] = useState(() => searchParams.has(PRACTICE_PARAM));
    const wordByKanji = useMemo(() => new Map(words.map((word) => [word.k, word])), [words]);
    const mistakeCount = mistakes?.length ?? 0;
    // the wrong choices come from the words up to the level, so they aren't much harder than the right one
    const choicePool = useMemo(() => wordsUpTo(words, level), [words, level]);

    const start = (nextLevel: string, nextMode = mode) => {
        setLevel(nextLevel);
        setMode(nextMode);
        setRound(newRound(words, nextLevel, nextMode));
    };

    const practice = (nextMode = mode) => {
        setMode(nextMode);
        if (mistakes && mistakes.length > 0) setRound(practiceRound(mistakes, wordByKanji, level, nextMode));
        else start(level, nextMode);
    };

    if (wantsPractice && mistakes !== null) {
        setWantsPractice(false);
        if (mistakes.length > 0) setRound(practiceRound(mistakes, wordByKanji, level, mode));
    }

    const finish = (answers: boolean[]) => {
        const played = round.words.map((word) => ({ word: word.k, reading: word.r, meaning: word.en }));
        // choosing is easier than typing: it changes the list of mistakes, but not the numbers
        const practiceOnly = round.practice || round.mode === "choose";
        void record({ level: round.level, answers, words: played, practice: practiceOnly }).then(reloadMistakes);
    };

    return (
        <>
            <div className="crossword-toolbar">
                <div className="segmented" role="group" aria-label="Art der Abfrage">
                    {MODES.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={mode === value}
                            onClick={() => (round.practice ? practice(value) : start(level, value))}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="crossword-level">
                    <span className="muted" id="kanji-level-label">Niveau bis</span>
                    <div className="segmented" role="group" aria-labelledby="kanji-level-label">
                        {LEVELS.map((l) => (
                            <button key={l} type="button" aria-pressed={!round.practice && level === l} onClick={() => start(l)}>
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => start(level)}>
                    <RefreshCw size={16} /> Neue Runde
                </button>
                {mistakeCount > 0 && (
                    <button type="button" className="btn btn-secondary btn-sm" aria-pressed={round.practice} onClick={() => practice()}>
                        <RotateCcw size={16} /> Meine Fehler ({mistakeCount})
                    </button>
                )}
                <details className="crossword-help">
                    <summary><CircleHelp size={16} /> So geht's</summary>
                    <p>
                        Tippe die Lesung des Wortes in Romaji, zum Beispiel „hon“ für 本 (book), und drücke Enter.
                        Groß- und Kleinschreibung und Leerzeichen sind egal, lange Vokale gehen kurz oder doppelt
                        („kyo“, „kyou“ oder „kyoo“ für kyō), Kana gehen auch. Eine Runde hat zehn Wörter.
                        Angemeldet kommen falsch gelesene Wörter auf deine Fehlerliste; „Meine Fehler“ fragt sie ab.
                        Zweimal in Folge richtig, und ein Wort ist wieder runter.
                    </p>
                    <p>
                        „Kanji wählen“ dreht es um: Lesung und Bedeutung stehen da, du wählst das Kanji aus vier aus
                        (auch mit den Tasten 1 bis 4). Falsch gewählte Wörter kommen auf die Fehlerliste, in Runden,
                        Quote und Serie zählt nur das Tippen.
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
                        <Trophy size={15} /> {stats.rounds} {stats.rounds === 1 ? "Runde" : "Runden"} · {hitRate(stats.rightWords, stats.askedWords)} richtig ·
                        Serie {stats.currentStreak} (beste {stats.bestStreak}) · <Link to={GAMES_BASE}>mehr</Link>
                    </>
                )}
            </p>
            {round.words.length === 0 ? (
                <div className="card empty-state"><p>Für dieses Niveau gibt es keine Wörter.</p></div>
            ) : (
                <KanjiRound
                    key={round.id}
                    words={round.words}
                    allWords={words}
                    choicePool={choicePool}
                    mode={round.mode}
                    practice={round.practice}
                    newLabel={round.practice && mistakeCount > 0 ? `Weiter üben (${mistakeCount})` : "Neue Runde"}
                    onNew={round.practice ? () => practice() : () => start(level)}
                    onFinished={finish}
                />
            )}
        </>
    );
}
