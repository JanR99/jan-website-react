import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { toHiragana } from "wanakana";
import type { Answer } from "../kanji/rounds";

/** The character; its romaji is typed. One per character: a new one starts with an empty field. */
export default function KanaQuestion({ kana, answer, last, onAnswer, onNext }: {
    kana: string;
    /** the answer to this character, once given */
    answer: Answer | null;
    /** the last character of the round: "Ergebnis" instead of "Weiter" */
    last: boolean;
    onAnswer: (typed: string) => void;
    onNext: () => void;
}) {
    const [typed, setTyped] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // the field keeps the focus, also after "Weiß ich nicht": Enter checks, then goes on to the next character
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
            <p className="kanji-word" lang="ja">{kana}</p>
            <p className="kanji-meaning">{toHiragana(kana) === kana ? "Hiragana" : "Katakana"}</p>

            <form className="kanji-form" onSubmit={submit}>
                <input
                    ref={inputRef}
                    className={`input kanji-input${answer ? (answer.right ? " is-right" : " is-wrong") : ""}`}
                    type="text"
                    value={typed}
                    onChange={(event) => !answer && setTyped(event.target.value)}
                    readOnly={answer !== null}
                    placeholder="Lesung in Romaji"
                    aria-label="Lesung in Romaji"
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
