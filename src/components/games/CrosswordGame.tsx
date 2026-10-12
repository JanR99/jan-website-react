import { useEffect, useMemo, useRef, useState } from "react";
import type { CompositionEvent, CSSProperties, FormEvent, KeyboardEvent } from "react";
import { Check, CircleHelp, Delete, Eye, RefreshCw } from "lucide-react";
import { toRomaji } from "wanakana";
import { useJapaneseWords } from "../../hooks/useJapaneseWords";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
    CEFR_LEVELS, cellKey, entryCells, generateCrossword, solutionGrid, wordsUpTo,
    type Crossword, type CrosswordEntry, type Direction, type JapaneseWord,
} from "../../utils/crossword";
import { isKatakanaWord, KANA_TABLE, modifyKana, toKatakanaChar, typedKana, type KanaModifier } from "../../utils/kana";
import PageHeader from "../layout/PageHeader";
import LoadError from "../ui/LoadError";
import { GAMES_BASE } from "./paths";
import "../../styles/Cookbook.css";
import "../../styles/Games.css";

const WORD_COUNT = 8;
const MAX_SIZE = 10;
const MAX_WORD_LENGTH = 6;
/** The levels to choose from; C2 has hardly any words of its own. */
const LEVELS = CEFR_LEVELS.slice(0, 5);

interface Puzzle {
    id: number;
    crossword: Crossword;
}

let nextPuzzleId = 1;

type Script = "hiragana" | "katakana" | "both";

const SCRIPTS: { value: Script; label: string }[] = [
    { value: "hiragana", label: "Hiragana" },
    { value: "katakana", label: "Katakana" },
    { value: "both", label: "Beide" },
];

function newPuzzle(words: JapaneseWord[], level: string, script: Script): Puzzle {
    // hiragana and katakana words never share a character, so they can't cross: "both" picks one of them by chance
    const katakana = script === "both" ? Math.random() < 0.5 : script === "katakana";
    const inScript = words.filter((word) => isKatakanaWord(word.w) === katakana);
    return { id: nextPuzzleId++, crossword: generateCrossword(wordsUpTo(inScript, level, MAX_WORD_LENGTH), WORD_COUNT, MAX_SIZE) };
}

/** A crossword of Japanese words: the squares take kana, chosen on a small kana keyboard below the grid. */
export default function CrosswordGame() {
    usePageTitle("Kreuzworträtsel");
    const { words, failed, retry } = useJapaneseWords();

    return (
        <div className="container crossword-page">
            {/* kept small, so grid and keyboard fit on the screen together */}
            <PageHeader back={{ to: GAMES_BASE, label: "Alle Spiele" }} title="Kreuzworträtsel" />
            {failed ? (
                <LoadError message="Die Wörter konnten nicht geladen werden." onRetry={retry} />
            ) : words === null ? (
                <div className="loading"><div className="spinner" /></div>
            ) : (
                <CrosswordSetup words={words} />
            )}
        </div>
    );
}

/** The level and the current puzzle; a new puzzle starts a fresh board. */
function CrosswordSetup({ words }: { words: JapaneseWord[] }) {
    const [level, setLevel] = useState("A1");
    const [script, setScript] = useState<Script>("hiragana");
    const [puzzle, setPuzzle] = useState(() => newPuzzle(words, level, script));

    const start = (nextLevel: string, nextScript: Script) => {
        setLevel(nextLevel);
        setScript(nextScript);
        setPuzzle(newPuzzle(words, nextLevel, nextScript));
    };

    return (
        <>
            <div className="crossword-toolbar">
                <div className="segmented" role="group" aria-label="Schrift">
                    {SCRIPTS.map(({ value, label }) => (
                        <button key={value} type="button" aria-pressed={script === value} onClick={() => start(level, value)}>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="crossword-level">
                    <span className="muted" id="crossword-level-label">Niveau bis</span>
                    <div className="segmented" role="group" aria-labelledby="crossword-level-label">
                        {LEVELS.map((l) => (
                            <button key={l} type="button" aria-pressed={level === l} onClick={() => start(l, script)}>
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => start(level, script)}>
                    <RefreshCw size={16} /> Neues Rätsel
                </button>
                <details className="crossword-help">
                    <summary><CircleHelp size={16} /> So geht's</summary>
                    <p>
                        Wähle ein Feld und setze die Zeichen mit der Tastatur. Ein zweiter Klick auf dasselbe Feld wechselt
                        die Richtung. Für が, ぱ oder っ zuerst ゛, ゜ oder 小 drücken und dann か, は oder つ. Am Computer kannst du auch Romaji tippen: „ka“ wird か, „da“ wird だ, für ん am Wortende „nn“; Pfeiltasten bewegen, Enter springt zum nächsten Wort.
                    </p>
                </details>
            </div>
            {puzzle.crossword.entries.length === 0 ? (
                <div className="card empty-state"><p>Für dieses Niveau gibt es nicht genug Wörter.</p></div>
            ) : (
                <CrosswordBoard key={puzzle.id} crossword={puzzle.crossword} onNew={() => start(level, script)} />
            )}
        </>
    );
}

/** Kept in the hidden input, so a backspace still arrives as a change. */
const SENTINEL = " ";

/** Typing on the keyboard is for computers; phones get no system keyboard, the kana keyboard is enough there. */
const hasMouse = () => window.matchMedia("(pointer: fine)").matches;

interface Position {
    row: number;
    col: number;
}

function CrosswordBoard({ crossword, onNew }: { crossword: Crossword; onNew: () => void }) {
    const solution = useMemo(() => solutionGrid(crossword), [crossword]);
    const numbers = useMemo(
        () => new Map(crossword.entries.map((entry) => [cellKey(entry.row, entry.col), entry.number])),
        [crossword],
    );
    const first = crossword.entries[0];

    const [filled, setFilled] = useState<Record<string, string>>({});
    const [cursor, setCursor] = useState<Position>({ row: first.row, col: first.col });
    const [direction, setDirection] = useState<Direction>(first.direction);
    const [wrong, setWrong] = useState<Set<string>>(new Set());
    const [checkedAll, setCheckedAll] = useState(false);
    const [revealed, setRevealed] = useState(false);
    /** romaji typed on the computer keyboard that is not a kana yet ("k", "ky", "n") */
    const [pending, setPending] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const skipEmptyInput = useRef(false);

    const focusInput = () => {
        if (hasMouse()) inputRef.current?.focus({ preventScroll: true });
    };

    // on a computer one can start typing right away
    useEffect(() => {
        focusInput();
    }, []);

    const entryAt = (position: Position, dir: Direction): CrosswordEntry | undefined =>
        crossword.entries.find((entry) => entry.direction === dir
            && entryCells(entry).some(([r, c]) => r === position.row && c === position.col));
    const other = (dir: Direction): Direction => (dir === "across" ? "down" : "across");
    const active = entryAt(cursor, direction) ?? entryAt(cursor, other(direction))!;
    const activeCells = entryCells(active);
    const activeKeys = new Set(activeCells.map(([r, c]) => cellKey(r, c)));
    const katakana = isKatakanaWord(active.word);

    const solved = [...solution].every(([position, char]) => filled[position] === char);
    const done = solved || revealed;

    const select = (position: Position, dir: Direction) => {
        setPending("");
        setCursor(position);
        setDirection(entryAt(position, dir) ? dir : other(dir));
    };

    const clickCell = (row: number, col: number) => {
        const sameCell = row === cursor.row && col === cursor.col;
        // a second tap on the same square switches to the word going the other way, if there is one
        const dir = sameCell && entryAt(cursor, other(active.direction)) ? other(active.direction) : active.direction;
        select({ row, col }, dir);
        focusInput();
    };

    const setCell = (position: string, char: string | null) => {
        const next = { ...filled };
        if (char === null) delete next[position];
        else next[position] = char;
        setFilled(next);
        if (wrong.has(position)) {
            const nextWrong = new Set(wrong);
            nextWrong.delete(position);
            setWrong(nextWrong);
        }
        setCheckedAll(false);
    };

    /** Puts the characters into the squares of the word from the cursor on and moves the cursor along. */
    const write = (kana: string) => {
        if (done || !kana) return;
        let index = activeCells.findIndex(([r, c]) => r === cursor.row && c === cursor.col);
        const next = { ...filled };
        const nextWrong = new Set(wrong);
        for (const char of kana) {
            if (index >= activeCells.length) break;
            const position = cellKey(...activeCells[index]);
            next[position] = char;
            nextWrong.delete(position);
            index++;
        }
        const [row, col] = activeCells[Math.min(index, activeCells.length - 1)];
        setFilled(next);
        setWrong(nextWrong);
        setCheckedAll(false);
        setCursor({ row, col });
        setDirection(active.direction);
    };

    /** A key of the kana keyboard. */
    const press = (char: string) => {
        setPending("");
        write(char);
        focusInput();
    };

    /** Romaji (or kana from a Japanese keyboard) typed on the computer keyboard. */
    const type = (text: string) => {
        if (done) return;
        const finish = /\s/.test(text);
        const { kana, pending: rest } = typedKana(pending + text.replace(/\s/g, ""), katakana, finish);
        write(kana);
        setPending(rest);
    };

    const erase = () => {
        if (done) return;
        if (pending) {
            setPending(pending.slice(0, -1));
            return;
        }
        let index = activeCells.findIndex(([r, c]) => r === cursor.row && c === cursor.col);
        // an empty square: the one before it is deleted, like a backspace
        if (!filled[cellKey(cursor.row, cursor.col)] && index > 0) index--;
        const [row, col] = activeCells[index];
        setCell(cellKey(row, col), null);
        setCursor({ row, col });
        setDirection(active.direction);
    };

    const selectEntry = (entry: CrosswordEntry) => {
        select({ row: entry.row, col: entry.col }, entry.direction);
        focusInput();
    };

    const move = (dr: number, dc: number) => {
        const dir: Direction = dc !== 0 ? "across" : "down";
        for (let r = cursor.row + dr, c = cursor.col + dc; r >= 0 && c >= 0 && r < crossword.height && c < crossword.width; r += dr, c += dc) {
            if (solution.has(cellKey(r, c))) {
                select({ row: r, col: c }, dir);
                return;
            }
        }
        if (entryAt(cursor, dir)) setDirection(dir);
    };

    const nextEntry = (delta: number) => {
        const index = crossword.entries.indexOf(active);
        const entry = crossword.entries[(index + delta + crossword.entries.length) % crossword.entries.length];
        select({ row: entry.row, col: entry.col }, entry.direction);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const keys: Record<string, () => void> = {
            ArrowLeft: () => move(0, -1),
            ArrowRight: () => move(0, 1),
            ArrowUp: () => move(-1, 0),
            ArrowDown: () => move(1, 0),
            Backspace: () => {
                skipEmptyInput.current = true;
                erase();
            },
            Enter: () => {
                if (pending) type(" ");
                nextEntry(event.shiftKey ? -1 : 1);
            },
            Tab: () => {
                if (pending) type(" ");
                nextEntry(event.shiftKey ? -1 : 1);
            },
        };
        const action = keys[event.key];
        if (action) {
            event.preventDefault();
            action();
        }
    };

    const handleInput = (event: FormEvent<HTMLInputElement>) => {
        if ((event.nativeEvent as InputEvent).isComposing) return;
        const value = event.currentTarget.value;
        event.currentTarget.value = SENTINEL;
        if (value === "") {
            if (!skipEmptyInput.current) erase();
        } else {
            const text = value.startsWith(SENTINEL) ? value.slice(SENTINEL.length) : value;
            if (text) type(text);
        }
        skipEmptyInput.current = false;
    };

    // a Japanese keyboard: the finished characters arrive here
    const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
        event.currentTarget.value = SENTINEL;
        if (event.data) type(event.data);
    };

    const check = () => {
        const mistakes = new Set(
            [...solution].filter(([position, char]) => filled[position] && filled[position] !== char).map(([position]) => position),
        );
        setWrong(mistakes);
        setCheckedAll(true);
    };

    const reveal = () => {
        setFilled(Object.fromEntries(solution));
        setPending("");
        setWrong(new Set());
        setRevealed(true);
    };

    const mistakes = wrong.size;
    const label = (dir: Direction) => (dir === "across" ? "waagerecht" : "senkrecht");

    return (
        <div className="crossword">
            <div className="crossword-main">
                <p className="crossword-active-clue" aria-live="polite">
                    <strong>{active.number} {label(active.direction)}</strong> · {active.clue}
                    <span className="muted"> ({active.word.length} Zeichen)</span>
                </p>

                <div className="crossword-board">
                    <div
                        className="crossword-grid"
                        style={{ "--cols": crossword.width, "--rows": crossword.height } as CSSProperties}
                        role="grid"
                        aria-label="Kreuzworträtsel"
                    >
                        {Array.from({ length: crossword.height }, (_, row) =>
                            Array.from({ length: crossword.width }, (_, col) => {
                                const position = cellKey(row, col);
                                if (!solution.has(position)) return <span key={position} className="crossword-gap" />;
                                const isCursor = row === cursor.row && col === cursor.col;
                                const classes = [
                                    "crossword-cell",
                                    activeKeys.has(position) && "is-active-word",
                                    isCursor && "is-cursor",
                                    wrong.has(position) && "is-wrong",
                                    revealed && "is-revealed",
                                    solved && "is-solved",
                                ].filter(Boolean).join(" ");
                                return (
                                    <button
                                        key={position}
                                        type="button"
                                        className={classes}
                                        onClick={() => clickCell(row, col)}
                                        aria-label={`Feld ${row + 1}/${col + 1}${filled[position] ? `: ${filled[position]}` : ""}`}
                                    >
                                        {numbers.has(position) && <span className="crossword-number">{numbers.get(position)}</span>}
                                        <span className="crossword-char">
                                            {filled[position] ?? (isCursor && pending ? <span className="crossword-pending">{pending}</span> : "")}
                                        </span>
                                    </button>
                                );
                            }),
                        )}
                    </div>
                    <input
                        ref={inputRef}
                        className="crossword-input"
                        defaultValue={SENTINEL}
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        onCompositionEnd={handleCompositionEnd}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        tabIndex={-1}
                        aria-label="Eingabe mit der Tastatur: Romaji, z. B. ka für か"
                    />
                </div>
            </div>

            <div className="crossword-side">
                {done ? (
                    <div className="crossword-result card card-pad" role="status">
                        <p className={solved && !revealed ? "form-message form-message--success" : "muted"}>
                            {revealed ? "Das ist die Lösung." : "Geschafft – alles richtig!"}
                        </p>
                        <ul className="crossword-solution">
                            {crossword.entries.map((entry) => (
                                <li key={`${entry.number}-${entry.direction}`}>
                                    <strong lang="ja">{entry.word}</strong>
                                    <span className="muted">{toRomaji(entry.word)}</span>
                                    <span>{entry.clue}</span>
                                </li>
                            ))}
                        </ul>
                        <button type="button" className="btn" onClick={onNew}>
                            <RefreshCw size={16} /> Neues Rätsel
                        </button>
                    </div>
                ) : (
                    <>
                    <KanaKeyboard katakana={katakana} onKey={press} onErase={erase} />
                    <div className="crossword-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={check}>
                            <Check size={16} /> Prüfen
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={reveal}>
                            <Eye size={16} /> Lösung zeigen
                        </button>
                        {checkedAll && (
                            <span className="muted" role="status">
                                {mistakes === 0 ? "Bisher alles richtig." : `${mistakes} ${mistakes === 1 ? "Feld ist" : "Felder sind"} falsch.`}
                            </span>
                        )}
                    </div>
                    </>
                )}
            </div>

            <div className="crossword-clues">
                {(["across", "down"] as Direction[]).map((dir) => (
                    <section key={dir}>
                        <h2>{dir === "across" ? "Waagerecht" : "Senkrecht"}</h2>
                        <ol>
                            {crossword.entries.filter((entry) => entry.direction === dir).map((entry) => (
                                <li key={entry.number}>
                                    <button
                                        type="button"
                                        className={`crossword-clue${entry === active ? " is-active" : ""}`}
                                        onClick={() => selectEntry(entry)}
                                    >
                                        <strong>{entry.number}</strong> {entry.clue}
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </section>
                ))}
            </div>
        </div>
    );
}

const MODIFIER_KEYS: { modifier: KanaModifier; label: string; title: string }[] = [
    { modifier: "dakuten", label: "゛", title: "゛ – danach z. B. か für が" },
    { modifier: "handakuten", label: "゜", title: "゜ – danach z. B. は für ぱ" },
    { modifier: "small", label: "小", title: "klein – danach z. B. つ für っ" },
];

/**
 * The kana table as buttons, in hiragana or in katakana like the active word. ゛ ゜ 小 come first:
 * pressed, the table shows が ぱ っ … for the next key, and the keys they don't apply to are off.
 */
function KanaKeyboard({ katakana, onKey, onErase }: {
    katakana: boolean;
    onKey: (char: string) => void;
    onErase: () => void;
}) {
    const [armed, setArmed] = useState<KanaModifier | null>(null);
    const show = (char: string) => {
        const shown = katakana ? toKatakanaChar(char) : char;
        return armed ? modifyKana(shown, armed) : shown;
    };

    const pressKey = (char: string) => {
        onKey(show(char));
        setArmed(null);
    };

    return (
        <div className="kana-keyboard" role="group" aria-label={katakana ? "Katakana-Tastatur" : "Hiragana-Tastatur"} lang="ja">
            <div className="kana-keys">
                {KANA_TABLE.flatMap((row, r) => row.map((char, c) => {
                    if (!char) return <span key={`${r}-${c}`} className="kana-key-gap" />;
                    const shown = show(char);
                    // with ゛ ゜ 小 pressed, only the keys that change are of use
                    const off = armed !== null && shown === (katakana ? toKatakanaChar(char) : char);
                    return (
                        <button key={`${r}-${c}`} type="button" className="kana-key" onClick={() => pressKey(char)} disabled={off}>
                            {shown}
                        </button>
                    );
                }))}
            </div>
            <div className="kana-keys-extra">
                {MODIFIER_KEYS.map(({ modifier, label, title }) => (
                    <button
                        key={modifier}
                        type="button"
                        className="kana-key kana-key--modifier"
                        onClick={() => setArmed(armed === modifier ? null : modifier)}
                        aria-pressed={armed === modifier}
                        title={title}
                        aria-label={title}
                    >
                        {label}
                    </button>
                ))}
                <button type="button" className="kana-key" onClick={() => onKey("ー")} aria-label="Langer Vokal ー">ー</button>
                <button type="button" className="kana-key kana-key--erase" onClick={onErase} title="Löschen" aria-label="Löschen">
                    <Delete size={18} />
                </button>
            </div>
        </div>
    );
}
