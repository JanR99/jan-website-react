import { useState } from "react";
import { isRightReading, type KanjiWord } from "../../../utils/kanjiReading";
import RomajiQuestion from "../RomajiQuestion";
import { kanjiItem } from "../readingItems";
import RoundResult from "../RoundResult";
import ChooseQuestion from "./ChooseQuestion";
import KanjiFeedback from "./KanjiFeedback";
import type { Answer, Mode } from "./rounds";

/** One round: the words one after the other, each with its solution after the answer, then the result. */
export default function KanjiRound({ words, allWords, choicePool, mode, practice, newLabel, onNew, onFinished }: {
    words: KanjiWord[];
    /** the whole word list, for other words with the same kanji */
    allWords: KanjiWord[];
    /** the words the wrong choices are taken from */
    choicePool: KanjiWord[];
    mode: Mode;
    /** a round of the own mistakes */
    practice: boolean;
    /** the label of the button for the next round on the result */
    newLabel: string;
    onNew: () => void;
    /** once, when the last word is answered and the result is opened: for each word whether it was read right */
    onFinished: (answers: boolean[]) => void;
}) {
    const [answers, setAnswers] = useState<Answer[]>([]);
    /** whether the current word is answered and its solution shown */
    const [showing, setShowing] = useState(false);

    const index = showing ? answers.length - 1 : answers.length;
    if (index >= words.length) {
        return <RoundResult items={words.map(kanjiItem)} answers={answers} practice={practice} newLabel={newLabel} onNew={onNew} />;
    }
    const word = words[index];
    const answer = showing ? answers[answers.length - 1] : null;
    const last = index + 1 === words.length;

    const answerWith = (typed: string, right: boolean) => {
        setAnswers([...answers, { typed, right }]);
        setShowing(true);
    };

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
                        key={w.k}
                        className={i < answers.length ? (answers[i].right ? "is-right" : "is-wrong") : i === index ? "is-current" : ""}
                    />
                ))}
            </ol>

            {mode === "choose" ? (
                <ChooseQuestion
                    key={index}
                    word={word}
                    choicePool={choicePool}
                    answer={answer}
                    last={last}
                    onChoose={(kanji) => answerWith(kanji, kanji === word.k)}
                    onNext={next}
                />
            ) : (
                <RomajiQuestion
                    key={index}
                    prompt={word.k}
                    hint={word.en}
                    answer={answer}
                    last={last}
                    onAnswer={(typed) => answerWith(typed, isRightReading(typed, word.r))}
                    onNext={next}
                />
            )}

            {answer && <KanjiFeedback word={word} answer={answer} mode={mode} allWords={allWords} />}
        </section>
    );
}
