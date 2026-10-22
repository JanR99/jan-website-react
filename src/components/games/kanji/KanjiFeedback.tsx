import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { KANJI, otherReadings, readingAsKana, type KanjiWord } from "../../../utils/kanjiReading";
import SpeakButton from "../../ui/SpeakButton";
import type { Answer, Mode } from "./rounds";

/** The solution after an answer: the reading, other readings of the kanji and the example sentence. */
export default function KanjiFeedback({ word, answer, mode, allWords }: {
    word: KanjiWord;
    answer: Answer;
    mode: Mode;
    /** the whole word list, for other words with the same kanji */
    allWords: KanjiWord[];
}) {
    const others = useMemo(() => otherReadings(word, allWords), [word, allWords]);

    return (
        <div className={`kanji-feedback ${answer.right ? "is-right" : "is-wrong"}`}>
            <p>
                {answer.right ? <><Check size={18} /> Richtig: </> : <><X size={18} /> Richtig wäre: </>}
                {mode === "choose" && <span lang="ja" className="kanji-feedback-word">{word.k}</span>}
                <strong>{word.r.toLowerCase()}</strong>
                <SpeakButton text={readingAsKana(word.r)} label={`${word.k} vorlesen`} />
            </p>
            {others.length > 0 && (
                <p className="kanji-others">
                    <span><span lang="ja">{[...word.k].filter((char) => KANJI.test(char)).join("")}</span> wird auch anders gelesen:</span>
                    <span>
                        {others.map((other, i) => (
                            <span key={other.k}>
                                {i > 0 && " · "}
                                <span className="kanji-others-word">
                                    <span lang="ja">{other.k}</span> <span className="muted">{other.r.toLowerCase()}</span>
                                </span>
                            </span>
                        ))}
                    </span>
                </p>
            )}
            {word.ex && (
                <p className="kanji-example">
                    <span lang="ja">
                        {word.ex} <SpeakButton text={word.ex} label="Beispielsatz vorlesen" />
                    </span>
                    <span className="muted">{word.exEn}</span>
                </p>
            )}
        </div>
    );
}
