import { describe, expect, it } from "vitest";
import { solutionGrid, type Crossword } from "../../../utils/crossword";
import { entryAt, firstOpenSquare, isOpen, openEntryAfter, rightWords } from "./board";

/**
 * か さ .
 * . く .
 * . ら い
 */
const crossword: Crossword = {
    width: 3,
    height: 3,
    entries: [
        { word: "かさ", clue: "umbrella", row: 0, col: 0, direction: "across", number: 1 },
        { word: "さくら", clue: "cherry", row: 0, col: 1, direction: "down", number: 2 },
        { word: "らい", clue: "next", row: 2, col: 1, direction: "across", number: 3 },
    ],
};
const solution = solutionGrid(crossword);
const [kasa, sakura, rai] = crossword.entries;

describe("board", () => {
    it("finds the word through a square in a direction", () => {
        expect(entryAt(crossword, { row: 0, col: 1 }, "across")).toBe(kasa);
        expect(entryAt(crossword, { row: 0, col: 1 }, "down")).toBe(sakura);
        expect(entryAt(crossword, { row: 1, col: 1 }, "across")).toBeUndefined();
    });

    it("counts empty and wrong squares as open", () => {
        expect(isOpen("0,0", {}, new Set())).toBe(true);
        expect(isOpen("0,0", { "0,0": "か" }, new Set())).toBe(false);
        expect(isOpen("0,0", { "0,0": "か" }, new Set(["0,0"]))).toBe(true);
    });

    it("goes on to the next word with an open square, around the end", () => {
        const grid = { "0,0": "か", "0,1": "さ", "1,1": "く", "2,1": "ら" };
        expect(openEntryAfter(crossword, kasa, grid, new Set())).toBe(rai);
        expect(openEntryAfter(crossword, rai, grid, new Set())).toBe(null);
        expect(openEntryAfter(crossword, rai, { ...grid, "2,2": "い" }, new Set(["0,0"]))).toBe(kasa);
        expect(firstOpenSquare(rai, grid, new Set())).toEqual({ row: 2, col: 2 });
    });

    it("counts the right words without the ones with a shown square", () => {
        const grid = Object.fromEntries(solution);
        expect(rightWords(crossword, solution, grid, new Set())).toBe(3);
        expect(rightWords(crossword, solution, grid, new Set(["2,2"]))).toBe(2);
        expect(rightWords(crossword, solution, { ...grid, "0,0": "が" }, new Set())).toBe(2);
    });
});
