import { Link } from "react-router-dom";
import { RotateCcw, X } from "lucide-react";
import type { KanjiMistake } from "../../types/games";
import { readingAsKana } from "../../utils/kanjiReading";
import SpeakButton from "../ui/SpeakButton";
import { KANJI_PRACTICE_PATH } from "./paths";
import "../../styles/Games.css";

/** The own mistakes in "Kanji lesen", most often wrong first, each with a button to take it off the list. */
export default function KanjiMistakesList({ mistakes, onRemove }: {
    mistakes: KanjiMistake[];
    onRemove: (word: string) => void;
}) {
    return (
        <section className="game-stats card card-pad">
            <h2>Deine Fehler ({mistakes.length})</h2>
            <p className="muted game-stats-hint">
                Wörter, die du falsch gelesen hast. Zweimal in Folge richtig, und ein Wort ist wieder runter.
            </p>
            <ul className="kanji-mistakes">
                {mistakes.map((mistake) => (
                    <li key={mistake.word}>
                        <span lang="ja" className="kanji-mistakes-word">{mistake.word}</span>
                        <span className="kanji-mistakes-text">
                            <strong>{mistake.reading.toLowerCase()}</strong>
                            <SpeakButton text={readingAsKana(mistake.reading)} label={`${mistake.word} vorlesen`} />
                            <span className="muted">{mistake.meaning}</span>
                        </span>
                        <span className="kanji-mistakes-count muted">
                            {mistake.wrong}× falsch{mistake.rightInRow > 0 && ", 1× richtig"}
                        </span>
                        <button
                            type="button"
                            className="icon-btn"
                            onClick={() => onRemove(mistake.word)}
                            aria-label={`${mistake.word} von der Liste nehmen`}
                            title="Von der Liste nehmen"
                        >
                            <X size={16} />
                        </button>
                    </li>
                ))}
            </ul>
            <Link to={KANJI_PRACTICE_PATH} className="btn btn-secondary">
                <RotateCcw size={16} /> Fehler üben
            </Link>
        </section>
    );
}
