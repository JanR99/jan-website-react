import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { kanjiChoices } from "../../../utils/kanjiChoices";
import { readingAsKana, type KanjiWord } from "../../../utils/kanjiReading";
import SpeakButton from "../../ui/SpeakButton";
import type { Answer } from "./rounds";

/** Reading and meaning; the kanji is picked out of four, also with the keys 1 to 4. One per word. */
export default function ChooseQuestion({ word, choicePool, answer, last, onChoose, onNext }: {
    word: KanjiWord;
    /** the words the wrong choices are taken from */
    choicePool: KanjiWord[];
    /** the answer to this word, once given */
    answer: Answer | null;
    /** the last word of the round: "Ergebnis" instead of "Weiter" */
    last: boolean;
    /** the chosen word, "" for "Weiß ich nicht" */
    onChoose: (kanji: string) => void;
    onNext: () => void;
}) {
    const choices = useMemo(() => kanjiChoices(word, choicePool), [word, choicePool]);
    const nextRef = useRef<HTMLButtonElement>(null);

    // after a choice "Weiter" has the focus, so Enter goes on
    useEffect(() => {
        if (answer) nextRef.current?.focus({ preventScroll: true });
    }, [answer]);

    const onKey = useEffectEvent((event: KeyboardEvent) => {
        const number = Number(event.key);
        if (!event.ctrlKey && !event.metaKey && !event.altKey && number >= 1 && number <= choices.length) {
            onChoose(choices[number - 1].k);
        }
    });
    useEffect(() => {
        if (answer) return;
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [answer]);

    const choiceClass = (choice: KanjiWord) =>
        !answer ? "" : choice.k === word.k ? " is-right" : choice.k === answer.typed ? " is-wrong" : "";

    return (
        <>
            <p className="kanji-word kanji-word--reading">
                {word.r.toLowerCase()} <SpeakButton text={readingAsKana(word.r)} label="Lesung vorlesen" />
            </p>
            <p className="kanji-meaning">{word.en}</p>
            <div className="kanji-choices" role="group" aria-label="Welches Kanji passt?">
                {choices.map((choice, i) => (
                    <button
                        key={choice.k}
                        type="button"
                        lang="ja"
                        className={`kanji-choice${choiceClass(choice)}`}
                        disabled={answer !== null}
                        onClick={() => onChoose(choice.k)}
                    >
                        <span className="kanji-choice-key" aria-hidden="true">{i + 1}</span>
                        {choice.k}
                    </button>
                ))}
            </div>
            <div className="kanji-form">
                {answer ? (
                    <button type="button" className="btn" ref={nextRef} onClick={onNext}>
                        {last ? "Ergebnis" : <>Weiter <ArrowRight size={16} /></>}
                    </button>
                ) : (
                    <button type="button" className="btn btn-secondary" onClick={() => onChoose("")}>
                        Weiß ich nicht
                    </button>
                )}
            </div>
        </>
    );
}
