import { useState } from "react";
import { Delete } from "lucide-react";
import { KANA_TABLE, modifyKana, toKatakanaChar, type KanaModifier } from "../../../utils/kana";

const MODIFIER_KEYS: { modifier: KanaModifier; label: string; title: string }[] = [
    { modifier: "dakuten", label: "゛", title: "゛ – danach z. B. か für が" },
    { modifier: "handakuten", label: "゜", title: "゜ – danach z. B. は für ぱ" },
    { modifier: "small", label: "小", title: "klein – danach z. B. つ für っ" },
];

/**
 * The kana table as buttons, in hiragana or in katakana like the active word. ゛ ゜ 小 come first:
 * pressed, the table shows が ぱ っ … for the next key, and the keys they don't apply to are off.
 */
export default function KanaKeyboard({ katakana, onKey, onErase }: {
    katakana: boolean;
    onKey: (char: string) => void;
    onErase: () => void;
}) {
    const [armed, setArmed] = useState<KanaModifier | null>(null);
    const show = (char: string) => {
        const shown = katakana ? toKatakanaChar(char) : char;
        return armed ? modifyKana(shown, armed) : shown;
    };

    const pressKey = (char: string) => {
        onKey(show(char));
        setArmed(null);
    };

    return (
        <div className="kana-keyboard" role="group" aria-label={katakana ? "Katakana-Tastatur" : "Hiragana-Tastatur"} lang="ja">
            <div className="kana-keys">
                {KANA_TABLE.flatMap((row, r) => row.map((char, c) => {
                    if (!char) return <span key={`${r}-${c}`} className="kana-key-gap" />;
                    const shown = show(char);
                    // with ゛ ゜ 小 pressed, only the keys that change are of use
                    const off = armed !== null && shown === (katakana ? toKatakanaChar(char) : char);
                    return (
                        <button key={`${r}-${c}`} type="button" className="kana-key" onClick={() => pressKey(char)} disabled={off}>
                            {shown}
                        </button>
                    );
                }))}
            </div>
            <div className="kana-keys-extra">
                {MODIFIER_KEYS.map(({ modifier, label, title }) => (
                    <button
                        key={modifier}
                        type="button"
                        className="kana-key kana-key--modifier"
                        onClick={() => setArmed(armed === modifier ? null : modifier)}
                        aria-pressed={armed === modifier}
                        title={title}
                        aria-label={title}
                    >
                        {label}
                    </button>
                ))}
                <button type="button" className="kana-key" onClick={() => onKey("ー")} aria-label="Langer Vokal ー">ー</button>
                <button type="button" className="kana-key kana-key--erase" onClick={onErase} title="Löschen" aria-label="Löschen">
                    <Delete size={18} />
                </button>
            </div>
        </div>
    );
}
