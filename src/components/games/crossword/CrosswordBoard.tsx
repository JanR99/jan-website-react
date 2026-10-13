import { useEffect, useMemo, useRef, useState } from "react";
import type { CompositionEvent, InputEvent, KeyboardEvent } from "react";
import { Check, Eye, Lightbulb } from "lucide-react";
import { cellKey, entryCells, solutionGrid, type Crossword, type CrosswordEntry, type Direction } from "../../../utils/crossword";
import { isKatakanaWord, typedKana } from "../../../utils/kana";
import ActiveClue from "./ActiveClue";
import { entryAt, firstOpenSquare, isOpen, openEntryAfter, otherDirection, rightWords, type Grid, type Position } from "./board";
import CrosswordClues from "./CrosswordClues";
import CrosswordGrid from "./CrosswordGrid";
import CrosswordResult from "./CrosswordResult";
import KanaKeyboard from "./KanaKeyboard";

/** Kept in the hidden input, so a backspace still arrives as a change. */
const SENTINEL = " ";

/** Typing on the keyboard is for computers; phones get no system keyboard, the kana keyboard is enough there. */
const hasMouse = () => window.matchMedia("(pointer: fine)").matches;

/** Same width as the phone layout in Games.css, where the keyboard sits at the bottom of the screen. */
const isPhoneLayout = () => window.matchMedia("(max-width: 760px)").matches;

const directionLabel = (direction: Direction) => (direction === "across" ? "waagerecht" : "senkrecht");

/**
 * One crossword being played: the grid with the marked word, the kana keyboard (and typing romaji on a computer),
 * "Prüfen", "Feld aufdecken", "Lösung zeigen", the clues, and the result at the end.
 */
export default function CrosswordBoard({ crossword, onNew, onFinished }: {
    crossword: Crossword;
    onNew: () => void;
    /**
     * once, when the crossword is finished; solved: without any help ("Feld aufdecken" or "Lösung zeigen"),
     * rightWords: the words the player got without help
     */
    onFinished: (solved: boolean, rightWords: number) => void;
}) {
    const solution = useMemo(() => solutionGrid(crossword), [crossword]);
    const first = crossword.entries[0];

    const [filled, setFilled] = useState<Grid>({});
    const [cursor, setCursor] = useState<Position>({ row: first.row, col: first.col });
    const [direction, setDirection] = useState<Direction>(first.direction);
    const [wrong, setWrong] = useState<Set<string>>(new Set());
    const [locked, setLocked] = useState<Set<string>>(new Set());
    const [checkedAll, setCheckedAll] = useState(false);
    const [revealed, setRevealed] = useState(false);
    /** romaji typed on the computer keyboard that is not a kana yet ("k", "ky", "n") */
    const [pending, setPending] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const skipEmptyInput = useRef(false);
    const boardRef = useRef<HTMLDivElement>(null);

    const focusInput = () => {
        if (hasMouse()) inputRef.current?.focus({ preventScroll: true });
    };

    useEffect(() => {
        // on a computer one can start typing right away
        focusInput();
        // on a phone the grid is moved up to just below the header, so it isn't hidden behind the keyboard
        if (isPhoneLayout() && boardRef.current) {
            const header = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
            const top = boardRef.current.getBoundingClientRect().top + window.scrollY - header - 8;
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        }
    }, []);

    const active = entryAt(crossword, cursor, direction) ?? entryAt(crossword, cursor, otherDirection(direction))!;
    const activeCells = entryCells(active);
    const activeKeys = new Set(activeCells.map(([r, c]) => cellKey(r, c)));
    const katakana = isKatakanaWord(active.word);

    const solved = [...solution].every(([position, char]) => filled[position] === char);
    const done = solved || revealed;

    /** squares shown by "Feld aufdecken": their words don't count as got right */
    const hinted = useRef(new Set<string>());
    /** the words got right, counted when "Lösung zeigen" fills in the rest */
    const rightBeforeReveal = useRef(0);
    const reported = useRef(false);

    useEffect(() => {
        if (!done || reported.current) return;
        reported.current = true;
        // a revealed square makes it a crossword solved with help, which doesn't count as solved
        onFinished(
            !revealed && hinted.current.size === 0,
            revealed ? rightBeforeReveal.current : rightWords(crossword, solution, filled, hinted.current),
        );
    });

    const select = (position: Position, dir: Direction) => {
        setPending("");
        setCursor(position);
        setDirection(entryAt(crossword, position, dir) ? dir : otherDirection(dir));
    };

    const clickCell = (row: number, col: number) => {
        const sameCell = row === cursor.row && col === cursor.col;
        // a second tap on the same square switches to the word going the other way, if there is one
        const turn = sameCell && entryAt(crossword, cursor, otherDirection(active.direction));
        select({ row, col }, turn ? otherDirection(active.direction) : active.direction);
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

    const isLocked = (index: number) => locked.has(cellKey(...activeCells[index]));

    /** After the marked word is done (no empty or red square left): on to the next word that has one. */
    const goToNextOpenWord = (grid: Grid, wrongSquares: Set<string>): boolean => {
        const finished = activeCells.every(([r, c]) => !isOpen(cellKey(r, c), grid, wrongSquares));
        const nextOpen = finished ? openEntryAfter(crossword, active, grid, wrongSquares) : null;
        if (!nextOpen) return false;
        setCursor(firstOpenSquare(nextOpen, grid, wrongSquares)!);
        setDirection(nextOpen.direction);
        return true;
    };

    const write = (kana: string) => {
        if (done || !kana) return;
        let index = activeCells.findIndex(([r, c]) => r === cursor.row && c === cursor.col);
        const next = { ...filled };
        const nextWrong = new Set(wrong);
        for (const char of kana) {
            // typing the character a locked square already has goes past it
            if (index < activeCells.length && isLocked(index) && next[cellKey(...activeCells[index])] === char) {
                index++;
                continue;
            }
            while (index < activeCells.length && isLocked(index)) index++;
            if (index >= activeCells.length) break;
            const position = cellKey(...activeCells[index]);
            next[position] = char;
            nextWrong.delete(position);
            index++;
        }
        while (index < activeCells.length - 1 && isLocked(index)) index++;
        setFilled(next);
        setWrong(nextWrong);
        setCheckedAll(false);

        if (goToNextOpenWord(next, nextWrong)) return;
        const [row, col] = index >= activeCells.length
            ? activeCells.find(([r, c]) => isOpen(cellKey(r, c), next, nextWrong)) ?? activeCells[activeCells.length - 1]
            : activeCells[index];
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
        if (!filled[cellKey(cursor.row, cursor.col)] || isLocked(index)) {
            index--;
            while (index >= 0 && isLocked(index)) index--;
            if (index < 0) return;
        }
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
        if (entryAt(crossword, cursor, dir)) setDirection(dir);
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

    const handleInput = (event: InputEvent<HTMLInputElement>) => {
        if (event.nativeEvent.isComposing) return;
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
        const right = [...solution].filter(([position, char]) => filled[position] === char).map(([position]) => position);
        setWrong(mistakes);
        setLocked(new Set([...locked, ...right]));
        setPending("");
        setCheckedAll(true);
        focusInput();
    };

    const revealSquare = () => {
        if (done) return;
        const here = activeCells.findIndex(([r, c]) => r === cursor.row && c === cursor.col);
        const index = isLocked(here) ? activeCells.findIndex((_, i) => !isLocked(i)) : here;
        if (index < 0) return;
        const position = cellKey(...activeCells[index]);
        const next = { ...filled, [position]: solution.get(position)! };
        const nextWrong = new Set(wrong);
        nextWrong.delete(position);
        const nextLocked = new Set(locked).add(position);
        setFilled(next);
        setWrong(nextWrong);
        setLocked(nextLocked);
        hinted.current.add(position);
        setPending("");
        setCheckedAll(false);

        if (!goToNextOpenWord(next, nextWrong)) {
            let after = index + 1;
            while (after < activeCells.length - 1 && nextLocked.has(cellKey(...activeCells[after]))) after++;
            const [row, col] = activeCells[Math.min(after, activeCells.length - 1)];
            setCursor({ row, col });
            setDirection(active.direction);
        }
        focusInput();
    };

    const reveal = () => {
        rightBeforeReveal.current = rightWords(crossword, solution, filled, hinted.current);
        setFilled(Object.fromEntries(solution));
        setPending("");
        setWrong(new Set());
        setRevealed(true);
    };

    const mistakes = wrong.size;

    return (
        <div className="crossword">
            <div className="crossword-main">
                <ActiveClue
                    className="crossword-active-clue--top"
                    entry={active}
                    label={directionLabel(active.direction)}
                    onPrevious={() => { nextEntry(-1); focusInput(); }}
                    onNext={() => { nextEntry(1); focusInput(); }}
                />

                <div className="crossword-board" ref={boardRef}>
                    <CrosswordGrid
                        crossword={crossword}
                        solution={solution}
                        filled={filled}
                        cursor={cursor}
                        pending={pending}
                        activeKeys={activeKeys}
                        wrong={wrong}
                        locked={locked}
                        revealed={revealed}
                        solved={solved}
                        onSelect={clickCell}
                    />
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
                    <CrosswordResult crossword={crossword} solved={solved} revealed={revealed} onNew={onNew} />
                ) : (
                    <>
                        {/* on a phone the clue sits here, right above the keyboard at the bottom of the screen */}
                        <ActiveClue
                            className="crossword-active-clue--panel"
                            entry={active}
                            label={directionLabel(active.direction)}
                            onPrevious={() => nextEntry(-1)}
                            onNext={() => nextEntry(1)}
                        />
                        <KanaKeyboard katakana={katakana} onKey={press} onErase={erase} />
                        <div className="crossword-actions">
                            <button type="button" className="btn btn-secondary btn-sm" onClick={check}>
                                <Check size={16} /> Prüfen
                            </button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={revealSquare} title="Feld aufdecken">
                                <Lightbulb size={16} /> <span className="label-long">Feld aufdecken</span><span className="label-short">Tipp</span>
                            </button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={reveal} title="Lösung zeigen">
                                <Eye size={16} /> <span className="label-long">Lösung zeigen</span><span className="label-short">Lösung</span>
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

            <CrosswordClues
                crossword={crossword}
                active={active}
                locked={locked}
                // all crossed out once the player has solved it, not when the solution was shown
                solved={solved && !revealed}
                onSelect={selectEntry}
            />
        </div>
    );
}
