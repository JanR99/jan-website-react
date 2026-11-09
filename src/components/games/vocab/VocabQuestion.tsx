import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { ArrowRight, Check, Eye } from "lucide-react";
import type { VocabWord } from "../../../utils/vocab";
import type { Answer } from "../kanji/rounds";

/** The word in large, its reading on request, and the field for the English meaning. One per word (new key). */
export default function VocabQuestion({ word, answer, last, onAnswer, onNext }: {
    word: VocabWord;
    answer: Answer | null;
    last: boolean;
    onAnswer: (typed: string) => void;
    onNext: () => void;
}) {
    const [typed, setTyped] = useState("");
    const [showReading, setShowReading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // the field keeps the focus: Enter checks, then goes on to the next word
    useEffect(() => {
        inputRef.current?.focus({ preventScroll: true });
    }, [answer]);

    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (answer) onNext();
        else if (typed.trim()) onAnswer(typed.trim());
    };

    return (
        <>
            <p className="kanji-word" lang="ja">{word.word}</p>
            <p className="kanji-meaning">
                {word.reading && (showReading || answer) ? (
                    <span lang="ja">{word.reading}</span>
                ) : word.reading ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReading(true)}>
                        <Eye size={16} /> Lesung zeigen
                    </button>
                ) : null}
            </p>

            <form className="kanji-form" onSubmit={submit}>
                <input
                    ref={inputRef}
                    className={`input kanji-input${answer ? (answer.right ? " is-right" : " is-wrong") : ""}`}
                    type="text"
                    value={typed}
                    onChange={(event) => !answer && setTyped(event.target.value)}
                    readOnly={answer !== null}
                    placeholder="Bedeutung auf Englisch"
                    aria-label="Bedeutung auf Englisch"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint={answer ? "next" : "done"}
                />
                {answer ? (
                    <button type="submit" className="btn">
                        {last ? "Ergebnis" : <>Weiter <ArrowRight size={16} /></>}
                    </button>
                ) : (
                    <>
                        <button type="submit" className="btn" disabled={!typed.trim()}>
                            <Check size={16} /> Prüfen
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => onAnswer("")}>
                            Weiß ich nicht
                        </button>
                    </>
                )}
            </form>
        </>
    );
}
