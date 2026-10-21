import { useState } from "react";
import { isRightKana } from "../../../utils/kanaQuiz";
import type { Answer } from "../kanji/rounds";
import KanaFeedback from "./KanaFeedback";
import KanaQuestion from "./KanaQuestion";
import KanaResult from "./KanaResult";

/** One round: the characters one after the other, each with its solution after the answer, then the result. */
export default function KanaRound({ kana, practice, newLabel, onNew, onFinished }: {
    kana: string[];
    /** a round of the own mistakes */
    practice: boolean;
    /** the label of the button for the next round on the result */
    newLabel: string;
    onNew: () => void;
    /** once, when the last character is answered and the result is opened: for each whether it was read right */
    onFinished: (answers: boolean[]) => void;
}) {
    const [answers, setAnswers] = useState<Answer[]>([]);
    /** whether the current character is answered and its solution shown */
    const [showing, setShowing] = useState(false);

    const index = showing ? answers.length - 1 : answers.length;
    if (index >= kana.length) {
        return <KanaResult kana={kana} answers={answers} practice={practice} newLabel={newLabel} onNew={onNew} />;
    }
    const current = kana[index];
    const answer = showing ? answers[answers.length - 1] : null;

    const next = () => {
        setShowing(false);
        if (answers.length === kana.length) onFinished(answers.map((a) => a.right));
    };

    return (
        <section className="kanji-card card card-pad" aria-live="polite">
            {practice && <p className="kanji-mode">Fehler-Runde</p>}
            <ol className="kanji-progress" aria-label={`Zeichen ${index + 1} von ${kana.length}`}>
                {kana.map((k, i) => (
                    <li
                        key={k}
                        className={i < answers.length ? (answers[i].right ? "is-right" : "is-wrong") : i === index ? "is-current" : ""}
                    />
                ))}
            </ol>

            <KanaQuestion
                key={index}
                kana={current}
                answer={answer}
                last={index + 1 === kana.length}
                onAnswer={(typed) => {
                    setAnswers([...answers, { typed, right: isRightKana(typed, current) }]);
                    setShowing(true);
                }}
                onNext={next}
            />

            {answer && <KanaFeedback kana={current} answer={answer} />}
        </section>
    );
}
