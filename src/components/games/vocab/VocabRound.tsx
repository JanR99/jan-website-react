import { useState } from "react";
import { isRightMeaning, type VocabWord } from "../../../utils/vocab";
import type { Answer } from "../kanji/rounds";
import { vocabItem } from "../readingItems";
import RoundResult from "../RoundResult";
import VocabFeedback from "./VocabFeedback";
import VocabQuestion from "./VocabQuestion";

/** One round: the words one after the other, each with its solution after the answer, then the result. */
export default function VocabRound({ words, practice, newLabel, onNew, onFinished }: {
    words: VocabWord[];
    practice: boolean;
    newLabel: string;
    onNew: () => void;
    /** once, when the result is opened: for each word whether it was answered right */
    onFinished: (answers: boolean[]) => void;
}) {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [showing, setShowing] = useState(false);

    const index = showing ? answers.length - 1 : answers.length;
    if (index >= words.length) {
        return <RoundResult items={words.map(vocabItem)} answers={answers} practice={practice} newLabel={newLabel} onNew={onNew} />;
    }
    const word = words[index];
    const answer = showing ? answers[answers.length - 1] : null;

    const answerWith = (typed: string) => {
        setAnswers([...answers, { typed, right: isRightMeaning(typed, word.meaning) }]);
        setShowing(true);
    };

    const countAsRight = () => setAnswers([...answers.slice(0, -1), { ...answers[answers.length - 1], right: true }]);

    const next = () => {
        setShowing(false);
        if (answers.length === words.length) onFinished(answers.map((a) => a.right));
    };

    return (
        <section className="kanji-card card card-pad" aria-live="polite">
            {practice && <p className="kanji-mode">Fehler-Runde</p>}
            <ol className="kanji-progress" aria-label={`Wort ${index + 1} von ${words.length}`}>
                {words.map((w, i) => (
                    <li
                        key={w.word}
                        className={i < answers.length ? (answers[i].right ? "is-right" : "is-wrong") : i === index ? "is-current" : ""}
                    />
                ))}
            </ol>
            <VocabQuestion
                key={index}
                word={word}
                answer={answer}
                last={index + 1 === words.length}
                onAnswer={answerWith}
                onNext={next}
            />
            {answer && <VocabFeedback word={word} answer={answer} onCountAsRight={countAsRight} />}
        </section>
    );
}
