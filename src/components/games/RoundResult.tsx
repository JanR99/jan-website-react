import { Check, RefreshCw, X } from "lucide-react";
import SpeakButton from "../ui/SpeakButton";
import Confetti from "./Confetti";
import type { Answer } from "./kanji/rounds";
import type { ReadingItem } from "./readingItems";

/**
 * The end of a round of "Kana lesen" or "Kanji lesen": how many were right, every character or word with
 * its reading, and the way to the next round.
 */
export default function RoundResult({ items, answers, practice, newLabel, onNew }: {
    items: ReadingItem[];
    /** in the order of the items */
    answers: Answer[];
    practice: boolean;
    newLabel: string;
    onNew: () => void;
}) {
    const right = answers.filter((answer) => answer.right).length;
    return (
        <section className="kanji-result card card-pad" role="status">
            {right === items.length && <Confetti />}
            {practice && <p className="kanji-mode">Fehler-Runde</p>}
            <h2>{right} von {items.length} richtig</h2>
            <ul className="kanji-summary">
                {items.map((item, i) => (
                    <li key={item.text} className={answers[i].right ? "is-right" : "is-wrong"}>
                        {answers[i].right ? <Check size={16} aria-label="richtig" /> : <X size={16} aria-label="falsch" />}
                        <span lang="ja" className="kanji-summary-word">{item.text}</span>
                        <strong>{item.reading}</strong>
                        <SpeakButton text={item.speak} label={`${item.text} vorlesen`} />
                        {item.meaning && <span className="muted">{item.meaning}</span>}
                        {!answers[i].right && answers[i].typed && (
                            <span className="kanji-summary-typed">deine Antwort: {answers[i].typed}</span>
                        )}
                    </li>
                ))}
            </ul>
            <button type="button" className="btn" onClick={onNew} autoFocus>
                <RefreshCw size={16} /> {newLabel}
            </button>
        </section>
    );
}
