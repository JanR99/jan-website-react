import { cellKey, entryCells, type Crossword, type CrosswordEntry, type Direction } from "../../../utils/crossword";

/** All clues, across and down; the marked word is highlighted, words found right are crossed out. */
export default function CrosswordClues({ crossword, active, locked, solved, onSelect }: {
    crossword: Crossword;
    active: CrosswordEntry;
    /** squares found right by "Prüfen" */
    locked: Set<string>;
    /** the whole crossword filled in right by the player */
    solved: boolean;
    onSelect: (entry: CrosswordEntry) => void;
}) {
    return (
        <div className="crossword-clues">
            {(["across", "down"] as Direction[]).map((direction) => (
                <section key={direction}>
                    <h2>{direction === "across" ? "Waagerecht" : "Senkrecht"}</h2>
                    <ol>
                        {crossword.entries.filter((entry) => entry.direction === direction).map((entry) => (
                            <li key={entry.number}>
                                <button
                                    type="button"
                                    className={[
                                        "crossword-clue",
                                        entry === active && "is-active",
                                        (solved || entryCells(entry).every(([r, c]) => locked.has(cellKey(r, c)))) && "is-done",
                                    ].filter(Boolean).join(" ")}
                                    onClick={() => onSelect(entry)}
                                >
                                    <strong>{entry.number}</strong> {entry.clue}
                                </button>
                            </li>
                        ))}
                    </ol>
                </section>
            ))}
        </div>
    );
}
