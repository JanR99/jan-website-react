/** Reading Japanese aloud with the speech output of the browser; needs a Japanese voice on the device. */

const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window;

function japaneseVoice(): SpeechSynthesisVoice | undefined {
    return hasSpeech() ? window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("ja")) : undefined;
}

/** Whether a Japanese voice is there; the voices of some browsers arrive a moment after the page. */
export function canSpeakJapanese(): boolean {
    return japaneseVoice() !== undefined;
}

/** For useSyncExternalStore: calls back when the browser's voices change. */
export function subscribeToVoices(onChange: () => void): () => void {
    if (!hasSpeech()) return () => {};
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

/** Reads the text aloud in Japanese, instead of whatever is being read just now. */
export function speakJapanese(text: string): void {
    const voice = japaneseVoice();
    if (!voice) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}
