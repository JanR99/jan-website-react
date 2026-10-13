import { cellKey, entryCells, type Crossword, type CrosswordEntry, type Direction } from "../../../utils/crossword";

export interface Position {
    row: number;
    col: number;
}

/** The squares filled in so far, by cellKey. */
export type Grid = Record<string, string>;

export const otherDirection = (direction: Direction): Direction => (direction === "across" ? "down" : "across");

/** The word going in the direction through the square, if there is one. */
export function entryAt(crossword: Crossword, position: Position, direction: Direction): CrosswordEntry | undefined {
    return crossword.entries.find((entry) => entry.direction === direction
        && entryCells(entry).some(([r, c]) => r === position.row && c === position.col));
}

/** A square still to be done: empty, or marked wrong by "Prüfen". */
export const isOpen = (position: string, grid: Grid, wrong: Set<string>) => !grid[position] || wrong.has(position);

/** The next word in the order of the clues that still has an open square, null if there is none. */
export function openEntryAfter(crossword: Crossword, entry: CrosswordEntry, grid: Grid, wrong: Set<string>): CrosswordEntry | null {
    const start = crossword.entries.indexOf(entry);
    for (let i = 1; i < crossword.entries.length; i++) {
        const candidate = crossword.entries[(start + i) % crossword.entries.length];
        if (entryCells(candidate).some(([r, c]) => isOpen(cellKey(r, c), grid, wrong))) return candidate;
    }
    return null;
}

/** The first open square of a word, if it has one. */
export function firstOpenSquare(entry: CrosswordEntry, grid: Grid, wrong: Set<string>): Position | null {
    const square = entryCells(entry).find(([r, c]) => isOpen(cellKey(r, c), grid, wrong));
    return square ? { row: square[0], col: square[1] } : null;
}

/** The words filled in right, leaving out those with a square shown by "Feld aufdecken". */
export function rightWords(crossword: Crossword, solution: Map<string, string>, grid: Grid, hinted: Set<string>): number {
    return crossword.entries.filter((entry) =>
        entryCells(entry).every(([r, c]) => {
            const position = cellKey(r, c);
            return grid[position] === solution.get(position) && !hinted.has(position);
        })).length;
}
