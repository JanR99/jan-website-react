import { Check, X } from "lucide-react";
import type { VocabWord } from "../../../utils/vocab";
import SpeakButton from "../../ui/SpeakButton";
import type { Answer } from "../kanji/rounds";

/** The meanings after an answer; a typed answer counted wrong can be counted as right. */
export default function VocabFeedback({ word, answer, onCountAsRight }: {
    word: VocabWord;
    answer: Answer;
    onCountAsRight: () => void;
}) {
    return (
        <div className={`kanji-feedback ${answer.right ? "is-right" : "is-wrong"}`}>
            <p>
                {answer.right ? <><Check size={18} /> Richtig: </> : <><X size={18} /> Richtig wäre: </>}
                <strong>{word.meaning}</strong>
                <SpeakButton text={word.reading || word.word} label={`${word.word} vorlesen`} />
            </p>
            {!answer.right && answer.typed && (
                <p>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={onCountAsRight}>
                        <Check size={16} /> War doch richtig
                    </button>
                </p>
            )}
        </div>
    );
}
