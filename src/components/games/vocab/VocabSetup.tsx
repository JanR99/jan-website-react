import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CircleHelp, RefreshCw, RotateCcw } from "lucide-react";
import GamesController from "../../../controller/GamesController";
import { useVocabStats } from "../../../hooks/useGameStats";
import { useVocabMistakes } from "../../../hooks/useGameMistakes";
import type { JapaneseWord } from "../../../utils/crossword";
import { hitRate, roundCount } from "../../../utils/gameStats";
import type { KanjiWord } from "../../../utils/kanjiReading";
import { vocabWords } from "../../../utils/vocab";
import GameStatsLine from "../GameStatsLine";
import Spinner from "../../ui/Spinner";
import { LEVELS } from "../kanji/rounds";
import { PRACTICE_PARAM } from "../paths";
import { newRound, practiceRound, type Round } from "./rounds";
import VocabRound from "./VocabRound";

/** The level, the own numbers and the current round; logged in, the round takes the due words first. */
export default function VocabSetup({ kanji, kana }: { kanji: KanjiWord[]; kana: JapaneseWord[] }) {
    const [level, setLevel] = useState("A1");
    const [round, setRound] = useState<Round | null>(null);
    const { stats, loggedIn, record } = useVocabStats();
    const { mistakes, reload: reloadMistakes } = useVocabMistakes();
    const [searchParams] = useSearchParams();
    // coming with ?fehler (from the account): a round of mistakes, as soon as the list is there
    const [wantsPractice, setWantsPractice] = useState(() => searchParams.has(PRACTICE_PARAM));
    const mistakeCount = mistakes?.length ?? 0;

    /** for guests and when the boxes can't be loaded only new words */
    const loadCards = (l: string): Promise<VocabCard[]> =>
        loggedIn ? GamesController.getVocabCards(l).catch(() => []) : Promise.resolve([]);

    const start = (l: string) => {
        setLevel(l);
        setRound(null);
        void loadCards(l).then((cards) => setRound(newRound(vocabWords(kanji, kana, l), cards, l)));
    };

    const practice = () => {
        if (mistakes && mistakes.length > 0) setRound(practiceRound(mistakes, level));
        else start(level);
    };

    // the first round; later ones start with a click
    useEffect(() => {
        const cards = loggedIn ? GamesController.getVocabCards("A1").catch(() => []) : Promise.resolve([]);
        void cards.then((loaded) => setRound((current) => current ?? newRound(vocabWords(kanji, kana, "A1"), loaded, "A1")));
    }, [loggedIn, kanji, kana]);

    if (wantsPractice && mistakes !== null) {
        setWantsPractice(false);
        if (mistakes.length > 0) setRound(practiceRound(mistakes, level));
    }

    const finish = (answers: boolean[]) => {
        if (!round) return;
        const played = round.words.map((word) => ({ word: word.word, reading: word.reading, meaning: word.meaning }));
        void record({ level: round.level, answers, words: played, practice: round.practice }).then(reloadMistakes);
    };

    return (
        <>
            <div className="crossword-toolbar">
                <div className="crossword-level">
                    <span className="muted" id="vocab-level-label">Niveau</span>
                    <div className="segmented" role="group" aria-labelledby="vocab-level-label">
                        {LEVELS.map((l) => (
                            <button key={l} type="button" aria-pressed={!round?.practice && level === l} onClick={() => start(l)}>
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => start(level)}>
                    <RefreshCw size={16} /> Neue Runde
                </button>
                {mistakeCount > 0 && (
                    <button type="button" className="btn btn-secondary btn-sm" aria-pressed={round?.practice ?? false} onClick={practice}>
                        <RotateCcw size={16} /> Meine Fehler ({mistakeCount})
                    </button>
                )}
                <details className="crossword-help">
                    <summary><CircleHelp size={16} /> So geht's</summary>
                    <p>
                        Tippe die englische Bedeutung des Wortes und drücke Enter. Jede der angegebenen Bedeutungen
                        zählt, Groß- und Kleinschreibung, „to“, „a“ und „the“ sind egal, bei längeren Wörtern geht
                        ein Tippfehler durch. „Lesung zeigen“ verrät, wie ein Kanji-Wort gelesen wird. Wurde deine
                        Antwort zu Unrecht als falsch gewertet, zählt „War doch richtig“ sie als richtig.
                    </p>
                    <p>
                        Angemeldet merkt sich die Seite jedes Wort: Richtig beantwortete kommen erst nach 1, 2, 4, 8,
                        16, 32 und zuletzt 64 Tagen wieder, falsche schon am nächsten Tag. Eine Runde nimmt zuerst die
                        fälligen Wörter, dann neue. Falsche Wörter kommen außerdem auf deine Fehlerliste; „Meine Fehler“
                        fragt sie ab, zweimal in Folge richtig, und ein Wort ist wieder runter.
                    </p>
                </details>
            </div>
            <GameStatsLine
                loggedIn={loggedIn}
                counted="deine Wörter"
                stats={stats}
                summary={(s) => `${roundCount(s.rounds)} · ${hitRate(s.rightWords, s.askedWords)} richtig`}
            />
            {round === null ? (
                <Spinner />
            ) : round.words.length === 0 ? (
                <div className="card empty-state"><p>Für dieses Niveau gibt es keine Wörter.</p></div>
            ) : (
                <VocabRound
                    key={round.id}
                    words={round.words}
                    practice={round.practice}
                    newLabel={round.practice && mistakeCount > 0 ? `Weiter üben (${mistakeCount})` : "Neue Runde"}
                    onNew={round.practice ? practice : () => start(level)}
                    onFinished={finish}
                />
            )}
        </>
    );
}
