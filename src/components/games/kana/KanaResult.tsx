import { Check, RefreshCw, X } from "lucide-react";
import { kanaRomaji } from "../../../utils/kanaQuiz";
import SpeakButton from "../../ui/SpeakButton";
import Confetti from "../Confetti";
import type { Answer } from "../kanji/rounds";

/** The end of a round: how many were right, every character with its romaji, and the way to the next round. */
export default function KanaResult({ kana, answers, practice, newLabel, onNew }: {
    kana: string[];
    answers: Answer[];
    practice: boolean;
    newLabel: string;
    onNew: () => void;
}) {
    const right = answers.filter((answer) => answer.right).length;
    return (
        <section className="kanji-result card card-pad" role="status">
            {right === kana.length && <Confetti />}
            {practice && <p className="kanji-mode">Fehler-Runde</p>}
            <h2>{right} von {kana.length} richtig</h2>
            <ul className="kanji-summary">
                {kana.map((k, i) => (
                    <li key={k} className={answers[i].right ? "is-right" : "is-wrong"}>
                        {answers[i].right ? <Check size={16} aria-label="richtig" /> : <X size={16} aria-label="falsch" />}
                        <span lang="ja" className="kanji-summary-word">{k}</span>
                        <strong>{kanaRomaji(k)}</strong>
                        <SpeakButton text={k} label={`${k} vorlesen`} />
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
