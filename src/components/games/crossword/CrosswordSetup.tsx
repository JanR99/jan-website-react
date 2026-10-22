import { useState } from "react";
import { CircleHelp, RefreshCw } from "lucide-react";
import { useCrosswordStats } from "../../../hooks/useGameStats";
import type { JapaneseWord } from "../../../utils/crossword";
import GameStatsLine from "../GameStatsLine";
import CrosswordBoard from "./CrosswordBoard";
import { LEVELS, newPuzzle, SCRIPTS, type Script } from "./puzzles";

/** Script, level and the current puzzle with the own numbers above it; a new puzzle starts a fresh board. */
export default function CrosswordSetup({ words }: { words: JapaneseWord[] }) {
    const [level, setLevel] = useState("A1");
    const [script, setScript] = useState<Script>("hiragana");
    const [puzzle, setPuzzle] = useState(() => newPuzzle(words, level, script));
    const { stats, loggedIn, record } = useCrosswordStats();

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
                        die Richtung. Für が, ぱ oder っ zuerst ゛, ゜ oder 小 drücken und dann か, は oder つ. Am Computer kannst du auch Romaji tippen: „ka“ wird か, „da“ wird だ, für ん am Wortende „nn“; Pfeiltasten bewegen, Enter springt zum nächsten Wort. „Prüfen“ färbt richtige Felder grün und macht sie fest, falsche rot.
                    </p>
                </details>
            </div>
            <GameStatsLine
                loggedIn={loggedIn}
                counted="deine gelösten Rätsel"
                stats={stats}
                summary={(s) => `${s.solved} Rätsel gelöst · ${s.words} Wörter richtig`}
            />
            {puzzle.crossword.entries.length === 0 ? (
                <div className="card empty-state"><p>Für dieses Niveau gibt es nicht genug Wörter.</p></div>
            ) : (
                <CrosswordBoard
                    key={puzzle.id}
                    crossword={puzzle.crossword}
                    onNew={() => start(level, script)}
                    onFinished={(solved, rightWords) => record({ script: puzzle.script, level: puzzle.level, solved, rightWords })}
                />
            )}
        </>
    );
}
