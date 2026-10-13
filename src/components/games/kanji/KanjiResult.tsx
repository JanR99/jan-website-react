import { Check, RefreshCw, X } from "lucide-react";
import { readingAsKana, type KanjiWord } from "../../../utils/kanjiReading";
import SpeakButton from "../../ui/SpeakButton";
import Confetti from "../Confetti";
import type { Answer } from "./rounds";

/** The end of a round: how many were right, every word with its reading, and the way to the next round. */
export default function KanjiResult({ words, answers, practice, newLabel, onNew }: {
    words: KanjiWord[];
    answers: Answer[];
    practice: boolean;
    newLabel: string;
    onNew: () => void;
}) {
    const right = answers.filter((answer) => answer.right).length;
    return (
        <section className="kanji-result card card-pad" role="status">
            {right === words.length && <Confetti />}
            {practice && <p className="kanji-mode">Fehler-Runde</p>}
            <h2>{right} von {words.length} richtig</h2>
            <ul className="kanji-summary">
                {words.map((word, i) => (
                    <li key={word.k} className={answers[i].right ? "is-right" : "is-wrong"}>
                        {answers[i].right ? <Check size={16} aria-label="richtig" /> : <X size={16} aria-label="falsch" />}
                        <span lang="ja" className="kanji-summary-word">{word.k}</span>
                        <strong>{word.r.toLowerCase()}</strong>
                        <SpeakButton text={readingAsKana(word.r)} label={`${word.k} vorlesen`} />
                        <span className="muted">{word.en}</span>
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
