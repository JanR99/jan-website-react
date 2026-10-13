import { useSyncExternalStore } from "react";
import { Volume2 } from "lucide-react";
import { canSpeakJapanese, speakJapanese, subscribeToVoices } from "../../utils/speech";

/** A loudspeaker that reads the text aloud in Japanese; left out where the device has no Japanese voice. */
export default function SpeakButton({ text, label }: {
    /** what is read, best in kana or as a Japanese sentence */
    text: string;
    /** for screen readers and the tooltip, like "本 vorlesen" */
    label: string;
}) {
    const available = useSyncExternalStore(subscribeToVoices, canSpeakJapanese, () => false);
    if (!available) return null;
    return (
        <button
            type="button"
            className="icon-btn speak-btn"
            onClick={() => speakJapanese(text)}
            // a click doesn't take the focus, so Enter in the kanji game still goes on to the next word
            onMouseDown={(event) => event.preventDefault()}
            aria-label={label}
            title={label}
        >
            <Volume2 size={16} />
        </button>
    );
}
