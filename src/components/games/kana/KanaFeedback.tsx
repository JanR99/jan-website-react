import { Check, X } from "lucide-react";
import { kanaRomaji, otherScript } from "../../../utils/kanaQuiz";
import SpeakButton from "../../ui/SpeakButton";
import type { Answer } from "../kanji/rounds";

/** The solution after an answer: the romaji, read aloud, and the same character in the other script. */
export default function KanaFeedback({ kana, answer }: { kana: string; answer: Answer }) {
    return (
        <div className={`kanji-feedback ${answer.right ? "is-right" : "is-wrong"}`}>
            <p>
                {answer.right ? <><Check size={18} /> Richtig: </> : <><X size={18} /> Richtig wäre: </>}
                <strong>{kanaRomaji(kana)}</strong>
                <SpeakButton text={kana} label={`${kana} vorlesen`} />
            </p>
            <p className="kanji-others">
                <span>In der anderen Schrift: <span lang="ja" className="kanji-others-word">{otherScript(kana)}</span></span>
            </p>
        </div>
    );
}
