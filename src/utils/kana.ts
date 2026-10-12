import { isKatakana } from "wanakana";

/**
 * The basic hiragana as a table, one column per consonant (あ か さ … わ) and one row per vowel
 * (a i u e o); empty strings are gaps, as in the usual kana table.
 */
export const KANA_TABLE: string[][] = [
    ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"],
    ["い", "き", "し", "ち", "に", "ひ", "み", "", "り", ""],
    ["う", "く", "す", "つ", "ぬ", "ふ", "む", "ゆ", "る", "を"],
    ["え", "け", "せ", "て", "ね", "へ", "め", "", "れ", ""],
    ["お", "こ", "そ", "と", "の", "ほ", "も", "よ", "ろ", "ん"],
];

/** Pairs of a character and the one it turns into, both ways. */
function pairs(from: string, to: string): Map<string, string> {
    const map = new Map<string, string>();
    [...from].forEach((char, i) => {
        map.set(char, to[i]);
        map.set(to[i], char);
    });
    return map;
}

// ゛: か → が and back
const DAKUTEN = pairs("かきくけこさしすせそたちつてとはひふへほう", "がぎぐげござじずぜぞだぢづでどばびぶべぼゔ");
// ゜: は → ぱ and back
const HANDAKUTEN = pairs("はひふへほ", "ぱぴぷぺぽ");
// small: つ → っ, や → ゃ and back
const SMALL = pairs("あいうえおつやゆよわ", "ぁぃぅぇぉっゃゅょゎ");

const KATAKANA_OFFSET = 0x60;

export function toKatakanaChar(char: string): string {
    const code = char.charCodeAt(0);
    return code >= 0x3041 && code <= 0x3096 ? String.fromCharCode(code + KATAKANA_OFFSET) : char;
}

function toHiraganaChar(char: string): string {
    const code = char.charCodeAt(0);
    return code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - KATAKANA_OFFSET) : char;
}

export type KanaModifier = "dakuten" | "handakuten" | "small";

const MODIFIERS: Record<KanaModifier, Map<string, string>> = { dakuten: DAKUTEN, handakuten: HANDAKUTEN, small: SMALL };

/**
 * Changes a character the way the ゛, ゜ and 小 keys do: か ↔ が, は ↔ ぱ, つ ↔ っ. Works for hiragana and
 * katakana; a character the key doesn't apply to stays as it is. ゛ on ぱ gives ば, ゜ on ば gives ぱ.
 */
export function modifyKana(char: string, modifier: KanaModifier): string {
    const katakana = toHiraganaChar(char) !== char;
    let hiragana = toHiraganaChar(char);
    // the other mark first comes off: ゛ on ぱ gives ば
    const otherMark = modifier === "dakuten" ? HANDAKUTEN : modifier === "handakuten" ? DAKUTEN : null;
    if (otherMark?.has(hiragana) && !MODIFIERS[modifier].has(hiragana)) hiragana = otherMark.get(hiragana)!;
    const changed = MODIFIERS[modifier].get(hiragana) ?? hiragana;
    return katakana ? toKatakanaChar(changed) : changed;
}

/** Whether a word is written in katakana; ー alone doesn't decide it. */
export function isKatakanaWord(word: string): boolean {
    const letters = word.replace(/ー/g, "");
    return letters.length > 0 && isKatakana(letters);
}
