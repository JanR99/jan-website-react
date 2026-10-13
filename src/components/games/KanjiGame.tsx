import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, CircleHelp, RefreshCw, RotateCcw, Trophy, X } from "lucide-react";
import { useKanjiStats } from "../../hooks/useGameStats";
import { useJapaneseKanji } from "../../hooks/useJapaneseWords";
import { useKanjiMistakes } from "../../hooks/useKanjiMistakes";
import { usePageTitle } from "../../hooks/usePageTitle";
import type { KanjiMistake } from "../../types/games";
import { CEFR_LEVELS } from "../../utils/crossword";
import { kanjiChoices } from "../../utils/kanjiChoices";
import { isRightReading, otherReadings, readingAsKana, type KanjiWord } from "../../utils/kanjiReading";
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

/** type: the reading is typed for the kanji; choose: the kanji is picked out of four for reading and meaning */
type Mode = "type" | "choose";

const MODES: { value: Mode; label: string }[] = [
    { value: "type", label: "Lesung tippen" },
    { value: "choose", label: "Kanji wählen" },
];

interface Round {
    id: number;
    words: KanjiWord[];
    level: string;
    mode: Mode;
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
/** The words up to the level: A2 means A1 and A2. */
function wordsUpTo(words: KanjiWord[], level: string): KanjiWord[] {
    const allowed = LEVELS.slice(0, LEVELS.indexOf(level as (typeof LEVELS)[number]) + 1) as readonly string[];
    return words.filter((word) => allowed.includes(word.l));
}

function newRound(words: KanjiWord[], level: string, mode: Mode): Round {
    const pool = wordsUpTo(words, level);
    const recent = new Set(recentKanji);
    const picked = [
        ...shuffle(pool.filter((word) => !recent.has(word.k))),
        ...shuffle(pool.filter((word) => recent.has(word.k))),
    ].slice(0, ROUND_LENGTH);
    recentKanji.push(...picked.map((word) => word.k));
    recentKanji.splice(0, Math.max(0, recentKanji.length - Math.floor(pool.length * RECENT_SHARE)));
    return { id: nextRoundId++, words: picked, level, mode, practice: false };
}

/**
 * Up to ten of the own mistakes, most often wrong first. The word list gives the example sentence; a word that
 * isn't in it any more is asked with the reading and meaning stored with the mistake.
 */
function practiceRound(mistakes: KanjiMistake[], wordByKanji: Map<string, KanjiWord>, level: string, mode: Mode): Round {
    const picked = mistakes.slice(0, ROUND_LENGTH).map((mistake) =>
        wordByKanji.get(mistake.word) ?? { k: mistake.word, r: mistake.reading, en: mistake.meaning, l: "" },
    );
    return { id: nextRoundId++, words: shuffle(picked), level, mode, practice: true };
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

interface Answer {
    typed: string;
    right: boolean;
}

function KanjiRound({ words, allWords, choicePool, mode, practice, newLabel, onNew, onFinished }: {
    words: KanjiWord[];
    /** the whole word list, for other words with the same kanji */
    allWords: KanjiWord[];
    /** the words the wrong choices are taken from */
    choicePool: KanjiWord[];
    mode: Mode;
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
    const others = useMemo(() => (showing ? otherReadings(word, allWords) : []), [showing, word, allWords]);
    const choices = useMemo(() => (mode === "choose" ? kanjiChoices(word, choicePool) : []), [mode, word, choicePool]);
    const nextRef = useRef<HTMLButtonElement>(null);

    // typing: the field keeps the focus, also after "Weiß ich nicht": Enter checks, then goes on to the next word;
    // choosing: after a choice "Weiter" has it, so Enter goes on
    useEffect(() => {
        if (finished) return;
        if (mode === "type") inputRef.current?.focus({ preventScroll: true });
        else if (showing) nextRef.current?.focus({ preventScroll: true });
    }, [index, finished, showing, mode]);

    const answerWith = (text: string) => {
        setAnswers([...answers, { typed: text, right: isRightReading(text, word.r) }]);
        setShowing(true);
    };

    const choose = (choice: KanjiWord | null) => {
        setAnswers([...answers, { typed: choice?.k ?? "", right: choice?.k === word.k }]);
        setShowing(true);
    };

    // choosing with the keys 1 to 4
    const onKey = useEffectEvent((event: KeyboardEvent) => {
        const number = Number(event.key);
        if (!event.ctrlKey && !event.metaKey && !event.altKey && number >= 1 && number <= choices.length) {
            choose(choices[number - 1]);
        }
    });
    useEffect(() => {
        if (mode !== "choose" || showing || finished) return;
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mode, showing, finished]);

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

            {mode === "choose" ? (
                <>
                    <p className="kanji-word kanji-word--reading">
                        {word.r.toLowerCase()} <SpeakButton text={readingAsKana(word.r)} label="Lesung vorlesen" />
                    </p>
                    <p className="kanji-meaning">{word.en}</p>
                    <div className="kanji-choices" role="group" aria-label="Welches Kanji passt?">
                        {choices.map((choice, i) => (
                            <button
                                key={choice.k}
                                type="button"
                                lang="ja"
                                className={`kanji-choice${
                                    answer && choice.k === word.k ? " is-right" : answer && choice.k === answer.typed ? " is-wrong" : ""
                                }`}
                                disabled={showing}
                                onClick={() => choose(choice)}
                            >
                                <span className="kanji-choice-key" aria-hidden="true">{i + 1}</span>
                                {choice.k}
                            </button>
                        ))}
                    </div>
                    <div className="kanji-form">
                        {showing ? (
                            <button type="button" className="btn" ref={nextRef} onClick={next}>
                                {index + 1 < words.length ? <>Weiter <ArrowRight size={16} /></> : "Ergebnis"}
                            </button>
                        ) : (
                            <button type="button" className="btn btn-secondary" onClick={() => choose(null)}>
                                Weiß ich nicht
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <>
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
                </>
            )}

            {answer && (
                <div className={`kanji-feedback ${answer.right ? "is-right" : "is-wrong"}`}>
                    <p>
                        {answer.right ? <><Check size={18} /> Richtig: </> : <><X size={18} /> Richtig wäre: </>}
                        {mode === "choose" && <span lang="ja" className="kanji-feedback-word">{word.k}</span>}
                        <strong>{word.r.toLowerCase()}</strong>
                        <SpeakButton text={readingAsKana(word.r)} label={`${word.k} vorlesen`} />
                    </p>
                    {others.length > 0 && (
                        <p className="kanji-others">
                            <span><span lang="ja">{word.k.replace(/[^\u4e00-\u9fff々]/g, "")}</span> wird auch anders gelesen:</span>
                            <span>
                                {others.map((other, i) => (
                                    <span key={other.k}>
                                        {i > 0 && " · "}
                                        <span className="kanji-others-word">
                                            <span lang="ja">{other.k}</span> <span className="muted">{other.r.toLowerCase()}</span>
                                        </span>
                                    </span>
                                ))}
                            </span>
                        </p>
                    )}
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
