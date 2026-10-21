import { useState } from "react";
import { CircleHelp, RefreshCw } from "lucide-react";
import { KANA_GROUPS, newKanaRound, type KanaGroup } from "../../../utils/kanaQuiz";
import { SCRIPTS, type Script } from "../crossword/puzzles";
import KanaRound from "./KanaRound";

/** Script, groups of characters and the current round; a change starts a new round. */
export default function KanaSetup() {
    const [script, setScript] = useState<Script>("hiragana");
    const [groups, setGroups] = useState<KanaGroup[]>(["basic"]);
    const [round, setRound] = useState(() => newKanaRound(groups, script));

    const start = (nextScript: Script, nextGroups: KanaGroup[]) => {
        setScript(nextScript);
        setGroups(nextGroups);
        setRound(newKanaRound(nextGroups, nextScript));
    };

    // at least one group stays on
    const toggleGroup = (group: KanaGroup) => {
        const next = groups.includes(group) ? groups.filter((g) => g !== group) : [...groups, group];
        if (next.length > 0) start(script, next);
    };

    return (
        <>
            <div className="crossword-toolbar">
                <div className="segmented" role="group" aria-label="Schrift">
                    {SCRIPTS.map(({ value, label }) => (
                        <button key={value} type="button" aria-pressed={script === value} onClick={() => start(value, groups)}>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="crossword-level">
                    <span className="muted" id="kana-groups-label">Zeichen</span>
                    <div className="segmented" role="group" aria-labelledby="kana-groups-label">
                        {KANA_GROUPS.map(({ value, label }) => (
                            <button key={value} type="button" aria-pressed={groups.includes(value)} onClick={() => toggleGroup(value)}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => start(script, groups)}>
                    <RefreshCw size={16} /> Neue Runde
                </button>
                <details className="crossword-help">
                    <summary><CircleHelp size={16} /> So geht's</summary>
                    <p>
                        Tippe, wie das Zeichen gelesen wird, zum Beispiel „ka“ für か oder „kya“ für きゃ, und drücke Enter.
                        Groß- und Kleinschreibung sind egal, andere Schreibweisen gehen auch („si“ für し, „tu“ für つ,
                        „nn“ für ん), ebenso ぢ und づ als „ji“ und „zu“. Eine Runde hat zehn Zeichen.
                    </p>
                    <p>
                        Unter „Zeichen“ wählst du, was abgefragt wird: die Grundzeichen, die mit ゛ und ゜ (が, ぱ …)
                        und die Kombinationen (きゃ, しゅ …), auch mehrere zusammen.
                    </p>
                </details>
            </div>
            <KanaRound
                key={round.id}
                kana={round.kana}
                onNew={() => start(script, groups)}
            />
        </>
    );
}
