import { Link } from "react-router-dom";
import { RotateCcw, X } from "lucide-react";
import SpeakButton from "../ui/SpeakButton";
import type { ReadingItem } from "./readingItems";
import "../../styles/Games.css";

/** A mistake of "Kana lesen" or "Kanji lesen" with how often it was read wrong and right since. */
export interface MistakeItem extends ReadingItem {
    wrong: number;
    rightInRow: number;
}

/** The own mistakes in a game, most often wrong first, each with a button to take it off the list. */
export default function MistakesList({ mistakes, intro, practicePath, onRemove }: {
    mistakes: MistakeItem[];
    /** the line below the title, like "Zeichen, die du falsch gelesen hast. …" */
    intro: string;
    /** the game with a round of these mistakes */
    practicePath: string;
    /** takes a character or word off the list */
    onRemove: (text: string) => void;
}) {
    return (
        <section className="game-stats card card-pad">
            <h2>Deine Fehler ({mistakes.length})</h2>
            <p className="muted game-stats-hint">{intro}</p>
            <ul className="kanji-mistakes">
                {mistakes.map((mistake) => (
                    <li key={mistake.text}>
                        <span lang="ja" className="kanji-mistakes-word">{mistake.text}</span>
                        <span className="kanji-mistakes-text">
                            <strong>{mistake.reading}</strong>
                            <SpeakButton text={mistake.speak} label={`${mistake.text} vorlesen`} />
                            {mistake.meaning && <span className="muted">{mistake.meaning}</span>}
                        </span>
                        <span className="kanji-mistakes-count muted">
                            {mistake.wrong}× falsch{mistake.rightInRow > 0 && ", 1× richtig"}
                        </span>
                        <button
                            type="button"
                            className="icon-btn"
                            onClick={() => onRemove(mistake.text)}
                            aria-label={`${mistake.text} von der Liste nehmen`}
                            title="Von der Liste nehmen"
                        >
                            <X size={16} />
                        </button>
                    </li>
                ))}
            </ul>
            <Link to={practicePath} className="btn btn-secondary">
                <RotateCcw size={16} /> Fehler üben
            </Link>
        </section>
    );
}
