import type { CSSProperties } from "react";
import { cellKey, type Crossword } from "../../../utils/crossword";
import type { Grid, Position } from "./board";

/** The squares of the crossword as buttons, with numbers, letters and their colours. */
export default function CrosswordGrid({ crossword, solution, filled, cursor, pending, activeKeys, wrong, locked, revealed, solved, onSelect }: {
    crossword: Crossword;
    solution: Map<string, string>;
    filled: Grid;
    cursor: Position;
    /** romaji typed that is not a kana yet, shown in the cursor square */
    pending: string;
    /** the squares of the marked word */
    activeKeys: Set<string>;
    /** squares marked wrong by "Prüfen" */
    wrong: Set<string>;
    /** squares found right by "Prüfen" or shown by "Feld aufdecken" */
    locked: Set<string>;
    revealed: boolean;
    solved: boolean;
    onSelect: (row: number, col: number) => void;
}) {
    const numbers = new Map(crossword.entries.map((entry) => [cellKey(entry.row, entry.col), entry.number]));

    return (
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
                        locked.has(position) && "is-locked",
                        revealed && "is-revealed",
                        solved && !revealed && "is-solved",
                    ].filter(Boolean).join(" ");
                    return (
                        <button
                            key={position}
                            type="button"
                            className={classes}
                            onClick={() => onSelect(row, col)}
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
    );
}
