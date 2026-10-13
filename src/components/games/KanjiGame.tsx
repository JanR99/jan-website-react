import { useEffect, useMemo, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, CircleHelp, RefreshCw, RotateCcw, Trophy, X } from "lucide-react";
import { useKanjiStats } from "../../hooks/useGameStats";
import { useJapaneseKanji } from "../../hooks/useJapaneseWords";
import { useKanjiMistakes } from "../../hooks/useKanjiMistakes";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { KanjiMistake } from "../../types/games";
import { CEFR_LEVELS } from "../../utils/crossword";
import { isRightReading, readingAsKana, type KanjiWord } from "../../utils/kanjiReading";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../layout/PageHeader";
import LoadError from "../ui/LoadError";
import SpeakButton from "../ui/SpeakButton";
import Confetti from "./Confetti";
import { hitRate } from "./KanjiStatsTable";
import { GAMES_BASE, PRACTICE_PARAM } from "./paths";
import "../../styles/Cookbook.css";
import "../../styles/Games.css";

const ROUND_LENGTH = 10;
/** The levels to choose from; C2 has hardly any words of its own. */
const LEVELS = CEFR_LEVELS.slice(0, 5);

/** The words of the last rounds of this visit, oldest first; a new round takes others where it can. */
const recentKanji: string[] = [];
/** how much of the words of a level is remembered as recent, so a small level doesn't run out of words */
const RECENT_SHARE = 0.6;

interface Round {
    id: number;
    words: KanjiWord[];
    level: string;
    /** a round of the own mistakes: it changes only the list of mistakes, not the numbers */
    practice: boolean;
}


let nextRoundId = 1;

function shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/** Ten words up to the level (A2 means A1 and A2), words of the last rounds only when there are too few others. */
function newRound(words: KanjiWord[], level: string): Round {
    const allowed = LEVELS.slice(0, LEVELS.indexOf(level as (typeof LEVELS)[number]) + 1) as readonly string[];
    const pool = words.filter((word) => allowed.includes(word.l));
    const recent = new Set(recentKanji);
    const picked = [
        ...shuffle(pool.filter((word) => !recent.has(word.k))),
        ...shuffle(pool.filter((word) => recent.has(word.k))),
    ].slice(0, ROUND_LENGTH);
    recentKanji.push(...picked.map((word) => word.k));
    recentKanji.splice(0, Math.max(0, recentKanji.length - Math.floor(pool.length * RECENT_SHARE)));
    return { id: nextRoundId++, words: picked, level, practice: false };
}

/**
 * Up to ten of the own mistakes, most often wrong first. The word list gives the example sentence; a word that
 * isn't in it any more is asked with the reading and meaning stored with the mistake.
 */
function practiceRound(mistakes: KanjiMistake[], wordByKanji: Map<string, KanjiWord>, level: string): Round {
    const picked = mistakes.slice(0, ROUND_LENGTH).map((mistake) =>
        wordByKanji.get(mistake.word) ?? { k: mistake.word, r: mistake.reading, en: mistake.meaning, l: "" },
    );
    return { id: nextRoundId++, words: shuffle(picked), level, practice: true };
}

/** Kanji words with their meaning; the reading is typed in romaji. */
export default function KanjiGame() {
    usePageTitle("Kanji lesen");
    const { words, failed, retry } = useJapaneseKanji();

    return (
        <div className="container kanji-page">
            <PageHeader back={{ to: GAMES_BASE, label: "Alle Spiele" }} title="Kanji lesen" />
            {failed ? (
                <LoadError message="Die Kanji konnten nicht geladen werden." onRetry={retry} />
            ) : words === null ? (
                <div className="loading"><div className="spinner" /></div>
            ) : (
                <KanjiSetup words={words} />
            )}
        </div>
    );
}

/** The level and the current round; a new round starts fresh. */
function KanjiSetup({ words }: { words: KanjiWord[] }) {
    const [level, setLevel] = useState("A1");
    const [round, setRound] = useState(() => newRound(words, level));
    const { stats, loggedIn, record } = useKanjiStats();
    const { mistakes, reload: reloadMistakes } = useKanjiMistakes();
    const { openAuthDialog } = useAuth();
    const [searchParams] = useSearchParams();
    // coming with ?fehler (from the account): a round of mistakes, as soon as the list is there
    const [wantsPractice, setWantsPractice] = useState(() => searchParams.has(PRACTICE_PARAM));
    const wordByKanji = useMemo(() => new Map(words.map((word) => [word.k, word])), [words]);
    const mistakeCount = mistakes?.length ?? 0;

    const start = (nextLevel: string) => {
        setLevel(nextLevel);
        setRound(newRound(words, nextLevel));
    };

    const practice = () => {
        if (mistakes && mistakes.length > 0) setRound(practiceRound(mistakes, wordByKanji, level));
        else start(level);
    };

    if (wantsPractice && mistakes !== null) {
        setWantsPractice(false);
        if (mistakes.length > 0) setRound(practiceRound(mistakes, wordByKanji, level));
    }

    const finish = (answers: boolean[]) => {
        const played = round.words.map((word) => ({ word: word.k, reading: word.r, meaning: word.en }));
        void record({ level: round.level, answers, words: played, practice: round.practice }).then(reloadMistakes);
    };

    return (
        <>
            <div className="crossword-toolbar">
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
                    <button type="button" className="btn btn-secondary btn-sm" aria-pressed={round.practice} onClick={practice}>
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
                    practice={round.practice}
                    newLabel={round.practice && mistakeCount > 0 ? `Weiter üben (${mistakeCount})` : "Neue Runde"}
                    onNew={round.practice ? practice : () => start(level)}
                    onFinished={finish}
                />
            )}
        </>
    );
}

interface Answer {
    typed: string;
    right: boolean;
}

function KanjiRound({ words, practice, newLabel, onNew, onFinished }: {
    words: KanjiWord[];
    /** a round of the own mistakes */
    practice: boolean;
    /** the label of the button for the next round on the result */
    newLabel: string;
    onNew: () => void;
    /** once, when the last word is answered and the result is opened: for each word whether it was read right */
    onFinished: (answers: boolean[]) => void;
}) {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [typed, setTyped] = useState("");
    /** whether the current word is answered and its solution shown */
    const [showing, setShowing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const index = showing ? answers.length - 1 : answers.length;
    const finished = index >= words.length;
    const word = words[Math.min(index, words.length - 1)];
    const answer = showing ? answers[answers.length - 1] : null;

    // the field keeps the focus, also after "Weiß ich nicht": Enter checks, then goes on to the next word
    useEffect(() => {
        if (!finished) inputRef.current?.focus({ preventScroll: true });
    }, [index, finished, showing]);

    const answerWith = (text: string) => {
        setAnswers([...answers, { typed: text, right: isRightReading(text, word.r) }]);
        setShowing(true);
    };

    const next = () => {
        setShowing(false);
        setTyped("");
        if (answers.length === words.length) onFinished(answers.map((a) => a.right));
    };

    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (showing) next();
        else if (typed.trim()) answerWith(typed.trim());
    };

    if (finished) {
        const right = answers.filter((a) => a.right).length;
        return (
            <section className="kanji-result card card-pad" role="status">
                {right === words.length && <Confetti />}
                {practice && <p className="kanji-mode">Fehler-Runde</p>}
                <h2>{right} von {words.length} richtig</h2>
                <ul className="kanji-summary">
                    {words.map((w, i) => (
                        <li key={w.k} className={answers[i].right ? "is-right" : "is-wrong"}>
                            {answers[i].right ? <Check size={16} aria-label="richtig" /> : <X size={16} aria-label="falsch" />}
                            <span lang="ja" className="kanji-summary-word">{w.k}</span>
                            <strong>{w.r.toLowerCase()}</strong>
                            <SpeakButton text={readingAsKana(w.r)} label={`${w.k} vorlesen`} />
                            <span className="muted">{w.en}</span>
                            {!answers[i].right && answers[i].typed && <span className="kanji-summary-typed">deine Antwort: {answers[i].typed}</span>}
                        </li>
                    ))}
                </ul>
                <button type="button" className="btn" onClick={onNew} autoFocus>
                    <RefreshCw size={16} /> {newLabel}
                </button>
            </section>
        );
    }

    return (
        <section className="kanji-card card card-pad" aria-live="polite">
            {practice && <p className="kanji-mode">Fehler-Runde</p>}
            <ol className="kanji-progress" aria-label={`Wort ${index + 1} von ${words.length}`}>
                {words.map((w, i) => (
                    <li
                        key={w.k}
                        className={i < answers.length ? (answers[i].right ? "is-right" : "is-wrong") : i === index ? "is-current" : ""}
                    />
                ))}
            </ol>

            <p className="kanji-word" lang="ja">{word.k}</p>
            <p className="kanji-meaning">{word.en}</p>

            <form className="kanji-form" onSubmit={submit}>
                <input
                    ref={inputRef}
                    className={`input kanji-input${answer ? (answer.right ? " is-right" : " is-wrong") : ""}`}
                    type="text"
                    value={typed}
                    onChange={(event) => !showing && setTyped(event.target.value)}
                    readOnly={showing}
                    placeholder="Lesung in Romaji"
                    aria-label="Lesung in Romaji"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint={showing ? "next" : "done"}
                />
                {showing ? (
                    <button type="submit" className="btn">
                        {index + 1 < words.length ? <>Weiter <ArrowRight size={16} /></> : "Ergebnis"}
                    </button>
                ) : (
                    <>
                        <button type="submit" className="btn" disabled={!typed.trim()}>
                            <Check size={16} /> Prüfen
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => answerWith("")}>
                            Weiß ich nicht
                        </button>
                    </>
                )}
            </form>

            {answer && (
                <div className={`kanji-feedback ${answer.right ? "is-right" : "is-wrong"}`}>
                    <p>
                        {answer.right ? <><Check size={18} /> Richtig: </> : <><X size={18} /> Richtig wäre: </>}
                        <strong>{word.r.toLowerCase()}</strong>
                        <SpeakButton text={readingAsKana(word.r)} label={`${word.k} vorlesen`} />
                    </p>
                    {word.ex && (
                        <p className="kanji-example">
                            <span lang="ja">
                                {word.ex} <SpeakButton text={word.ex} label="Beispielsatz vorlesen" />
                            </span>
                            <span className="muted">{word.exEn}</span>
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}
