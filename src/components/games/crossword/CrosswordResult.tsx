import { RefreshCw } from "lucide-react";
import { toRomaji } from "wanakana";
import type { Crossword } from "../../../utils/crossword";
import SpeakButton from "../../ui/SpeakButton";
import Confetti from "../Confetti";

/** The end of a crossword: solved, or the solution shown; every word with romaji and clue. */
export default function CrosswordResult({ crossword, solved, revealed, onNew }: {
    crossword: Crossword;
    /** filled in right by the player */
    solved: boolean;
    /** filled in by "Lösung zeigen" */
    revealed: boolean;
    onNew: () => void;
}) {
    const won = solved && !revealed;
    return (
        <div className="crossword-result card card-pad" role="status">
            {won && <Confetti />}
            <p className={won ? "form-message form-message--success" : "muted"}>
                {revealed ? "Das ist die Lösung." : "Geschafft – alles richtig!"}
            </p>
            <ul className="crossword-solution">
                {crossword.entries.map((entry) => (
                    <li key={`${entry.number}-${entry.direction}`}>
                        <strong lang="ja">{entry.word}</strong>
                        <SpeakButton text={entry.word} label={`${entry.word} vorlesen`} />
                        <span className="muted">{toRomaji(entry.word)}</span>
                        <span>{entry.clue}</span>
                    </li>
                ))}
            </ul>
            <button type="button" className="btn" onClick={onNew}>
                <RefreshCw size={16} /> Neues Rätsel
            </button>
        </div>
    );
}
