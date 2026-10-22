import { Link } from "react-router-dom";
import { RotateCcw, X } from "lucide-react";
import type { KanaMistake } from "../../types/games";
import { kanaRomaji } from "../../utils/kanaQuiz";
import SpeakButton from "../ui/SpeakButton";
import { KANA_PRACTICE_PATH } from "./paths";
import "../../styles/Games.css";

/** The own mistakes in "Kana lesen", most often wrong first, each with a button to take it off the list. */
export default function KanaMistakesList({ mistakes, onRemove }: {
    mistakes: KanaMistake[];
    onRemove: (kana: string) => void;
}) {
    return (
        <section className="game-stats card card-pad">
            <h2>Deine Fehler ({mistakes.length})</h2>
            <p className="muted game-stats-hint">
                Zeichen, die du falsch gelesen hast. Zweimal in Folge richtig, und ein Zeichen ist wieder runter.
            </p>
            <ul className="kanji-mistakes">
                {mistakes.map((mistake) => (
                    <li key={mistake.kana}>
                        <span lang="ja" className="kanji-mistakes-word">{mistake.kana}</span>
                        <span className="kanji-mistakes-text">
                            <strong>{kanaRomaji(mistake.kana)}</strong>
                            <SpeakButton text={mistake.kana} label={`${mistake.kana} vorlesen`} />
                        </span>
                        <span className="kanji-mistakes-count muted">
                            {mistake.wrong}× falsch{mistake.rightInRow > 0 && ", 1× richtig"}
                        </span>
                        <button
                            type="button"
                            className="icon-btn"
                            onClick={() => onRemove(mistake.kana)}
                            aria-label={`${mistake.kana} von der Liste nehmen`}
                            title="Von der Liste nehmen"
                        >
                            <X size={16} />
                        </button>
                    </li>
                ))}
            </ul>
            <Link to={KANA_PRACTICE_PATH} className="btn btn-secondary">
                <RotateCcw size={16} /> Fehler üben
            </Link>
        </section>
    );
}
