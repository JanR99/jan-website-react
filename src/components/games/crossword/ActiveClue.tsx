import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CrosswordEntry } from "../../../utils/crossword";

/** The clue of the marked word, with buttons to the word before and after it. */
export default function ActiveClue({ className, entry, label, onPrevious, onNext }: {
    className: string;
    entry: CrosswordEntry;
    label: string;
    onPrevious: () => void;
    onNext: () => void;
}) {
    return (
        <div className={`crossword-active-clue ${className}`}>
            <button type="button" className="icon-btn" onClick={onPrevious} aria-label="Vorheriges Wort">
                <ChevronLeft size={18} />
            </button>
            <p aria-live="polite">
                <strong>{entry.number} {label}</strong> · {entry.clue}
                <span className="muted"> ({entry.word.length} Zeichen)</span>
            </p>
            <button type="button" className="icon-btn" onClick={onNext} aria-label="Nächstes Wort">
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
