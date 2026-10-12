/** A Japanese word as it comes from public/games/japanese-words.json. */
export interface JapaneseWord {
    /** the word in hiragana or katakana, one character per square */
    w: string;
    /** English meanings, the clue */
    en: string;
    /** CEFR level, A1 to C2 */
    l: string;
}

export type Direction = "across" | "down";

/** A word placed in the crossword. */
export interface CrosswordEntry {
    word: string;
    clue: string;
    row: number;
    col: number;
    direction: Direction;
    /** the number shown in its first square and before its clue */
    number: number;
}

export interface Crossword {
    width: number;
    height: number;
    entries: CrosswordEntry[];
}

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

/** The words up to the level (A2 means A1 and A2), with 2 to `maxLength` characters. */
export function wordsUpTo(words: JapaneseWord[], level: string, maxLength: number): JapaneseWord[] {
    const allowed = CEFR_LEVELS.slice(0, CEFR_LEVELS.indexOf(level as (typeof CEFR_LEVELS)[number]) + 1) as readonly string[];
    return words.filter((word) => allowed.includes(word.l) && word.w.length >= 2 && word.w.length <= maxLength);
}

interface Placement {
    word: JapaneseWord;
    row: number;
    col: number;
    direction: Direction;
}

const step = (direction: Direction) => (direction === "across" ? [0, 1] : [1, 0]);
const key = (row: number, col: number) => `${row},${col}`;

/** The squares filled so far, by position. */
type Grid = Map<string, string>;

/** How many existing letters the word would cross there, or -1 if it can't go there. */
function crossings(grid: Grid, word: string, row: number, col: number, direction: Direction): number {
    const [dr, dc] = step(direction);
    // the squares right before and after the word stay empty, so it doesn't run into another one
    if (grid.has(key(row - dr, col - dc)) || grid.has(key(row + dr * word.length, col + dc * word.length))) return -1;

    let count = 0;
    for (let i = 0; i < word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        const existing = grid.get(key(r, c));
        if (existing !== undefined) {
            if (existing !== word[i]) return -1;
            count++;
        } else if (grid.has(key(r + dc, c + dr)) || grid.has(key(r - dc, c - dr))) {
            // a new square must not touch a word running alongside
            return -1;
        }
    }
    return count;
}

function bounds(placements: Placement[]) {
    let top = Infinity, left = Infinity, bottom = -Infinity, right = -Infinity;
    for (const { word, row, col, direction } of placements) {
        const [dr, dc] = step(direction);
        top = Math.min(top, row);
        left = Math.min(left, col);
        bottom = Math.max(bottom, row + dr * (word.w.length - 1));
        right = Math.max(right, col + dc * (word.w.length - 1));
    }
    return { top, left, bottom, right };
}

/**
 * Builds a crossword from words chosen by chance: every word after the first one crosses at least one
 * that is already there, sharing a character. The grid stays within `maxSize` squares in each direction.
 *
 * @param words the words to choose from
 * @param count how many words the crossword should have; fewer if no more fit
 * @param random a function like Math.random, replaceable for tests
 * @param avoid words used shortly before: they only come in when the others don't fit
 */
export function generateCrossword(
    words: JapaneseWord[],
    count: number,
    maxSize = 10,
    random: () => number = Math.random,
    avoid: ReadonlySet<string> = new Set(),
): Crossword {
    const shuffled = shuffle(words.filter((word) => word.w.length <= maxSize), random);
    const pool = [...shuffled.filter((word) => !avoid.has(word.w)), ...shuffled.filter((word) => avoid.has(word.w))];
    const placements: Placement[] = [];
    const grid: Grid = new Map();
    const used = new Set<string>();

    const place = (placement: Placement) => {
        const [dr, dc] = step(placement.direction);
        [...placement.word.w].forEach((char, i) => grid.set(key(placement.row + dr * i, placement.col + dc * i), char));
        placements.push(placement);
        used.add(placement.word.w);
    };

    // a word of at least 4 characters in the middle, so the others have something to cross; not always
    // the longest one, or the few long words would be in nearly every crossword
    const first = pool.find((word) => word.w.length >= 4) ?? pool[0];
    if (!first) return { width: 0, height: 0, entries: [] };
    place({ word: first, row: 0, col: 0, direction: "across" });

    for (const word of pool) {
        if (placements.length >= count) break;
        if (used.has(word.w)) continue;

        let best: Placement[] = [];
        let bestCrossings = 0;
        for (const [position, char] of grid) {
            const [r, c] = position.split(",").map(Number);
            for (let i = 0; i < word.w.length; i++) {
                if (word.w[i] !== char) continue;
                for (const direction of ["across", "down"] as Direction[]) {
                    const [dr, dc] = step(direction);
                    const candidate = { word, row: r - dr * i, col: c - dc * i, direction };
                    const crossed = crossings(grid, word.w, candidate.row, candidate.col, direction);
                    if (crossed < 1) continue;
                    const box = bounds([...placements, candidate]);
                    if (box.bottom - box.top + 1 > maxSize || box.right - box.left + 1 > maxSize) continue;
                    if (crossed > bestCrossings) {
                        best = [candidate];
                        bestCrossings = crossed;
                    } else if (crossed === bestCrossings) {
                        best.push(candidate);
                    }
                }
            }
        }
        if (best.length > 0) place(best[Math.floor(random() * best.length)]);
    }

    return numbered(placements);
}

/** Moves the words so the grid starts at 0,0 and numbers them in reading order, like a printed crossword. */
function numbered(placements: Placement[]): Crossword {
    const { top, left, bottom, right } = bounds(placements);
    const starts = [...new Set(placements.map((p) => key(p.row - top, p.col - left)))]
        .map((position) => position.split(",").map(Number))
        .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const numbers = new Map(starts.map(([r, c], i) => [key(r, c), i + 1]));

    const entries = placements
        .map(({ word, row, col, direction }) => ({
            word: word.w,
            clue: word.en,
            row: row - top,
            col: col - left,
            direction,
            number: numbers.get(key(row - top, col - left))!,
        }))
        .sort((a, b) => a.number - b.number || (a.direction === "across" ? -1 : 1));

    return { width: right - left + 1, height: bottom - top + 1, entries };
}

/**
 * The fullest of a few crosswords built by generateCrossword: the one with the most words, and of those
 * the one with the most squares shared by two words.
 */
export function bestCrossword(
    words: JapaneseWord[],
    count: number,
    maxSize = 10,
    attempts = 6,
    random: () => number = Math.random,
    avoid: ReadonlySet<string> = new Set(),
): Crossword {
    let best: Crossword | null = null;
    let bestScore = -1;
    for (let i = 0; i < attempts; i++) {
        const crossword = generateCrossword(words, count, maxSize, random, avoid);
        const letters = crossword.entries.reduce((sum, entry) => sum + entry.word.length, 0);
        const shared = letters - solutionGrid(crossword).size;
        const score = crossword.entries.length * 100 + shared;
        if (score > bestScore) {
            best = crossword;
            bestScore = score;
        }
        if (crossword.entries.length >= count && shared >= count) break;
    }
    return best ?? { width: 0, height: 0, entries: [] };
}

function shuffle<T>(items: T[], random: () => number): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/** The squares of an entry, in order. */
export function entryCells(entry: Pick<CrosswordEntry, "word" | "row" | "col" | "direction">): [number, number][] {
    const [dr, dc] = step(entry.direction);
    return [...entry.word].map((_, i) => [entry.row + dr * i, entry.col + dc * i]);
}

/** The solution: the character of every square that belongs to a word, by "row,col". */
export function solutionGrid(crossword: Crossword): Map<string, string> {
    const solution = new Map<string, string>();
    for (const entry of crossword.entries) {
        entryCells(entry).forEach(([r, c], i) => solution.set(key(r, c), entry.word[i]));
    }
    return solution;
}

export const cellKey = key;
