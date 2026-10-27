import { isKana, toHiragana, toKatakana, toRomaji } from "wanakana";
import type { Script } from "../components/games/crossword/puzzles";
import { shuffle } from "./chance";
import { KANA_TABLE } from "./kana";
import { recentPicks } from "./recentPicks";

/** The groups of characters to practise: the basic ones, the ones with ゛ or ゜, and combinations like きゃ. */
export type KanaGroup = "basic" | "marked" | "combo";

const COMBO_STARTS = [..."きしちにひみりぎじびぴ"];

export const KANA_GROUPS: { value: KanaGroup; label: string; chars: string[] }[] = [
    { value: "basic", label: "Grundzeichen", chars: KANA_TABLE.flat().filter(Boolean) },
    { value: "marked", label: "が / ぱ", chars: [..."がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ"] },
    { value: "combo", label: "Kombinationen", chars: COMBO_STARTS.flatMap((start) => [..."ゃゅょ"].map((small) => start + small)) },
];

export const ROUND_LENGTH = 10;

/** The characters of the chosen groups in the chosen script; "both" has every character twice, in each script. */
export function kanaPool(groups: KanaGroup[], script: Script): string[] {
    const hiragana = KANA_GROUPS.filter((group) => groups.includes(group.value)).flatMap((group) => group.chars);
    if (script === "hiragana") return hiragana;
    const katakana = hiragana.map((kana) => toKatakana(kana));
    return script === "katakana" ? katakana : [...hiragana, ...katakana];
}

export interface KanaRound {
    id: number;
    kana: string[];
    /** a round of the own mistakes: it changes only the list of mistakes, not the numbers */
    practice: boolean;
}

const recentKana = recentPicks();

let nextRoundId = 1;

/** Ten characters of the pool, characters of the last rounds only when there are too few others. */
export function newKanaRound(groups: KanaGroup[], script: Script): KanaRound {
    const picked = recentKana.pick(kanaPool(groups, script), ROUND_LENGTH, (kana) => kana);
    return { id: nextRoundId++, kana: picked, practice: false };
}

/** Up to ten of the own mistakes (given most often wrong first), in a shuffled order. */
export function practiceKanaRound(mistakes: string[]): KanaRound {
    return { id: nextRoundId++, kana: shuffle(mistakes.slice(0, ROUND_LENGTH)), practice: true };
}

/** The romaji of a character as it is usually written (Hepburn): し → shi, を → wo, ヂ → ji. */
export const kanaRomaji = (kana: string) => toRomaji(kana);

/** The same character in the other script: あ → ア, キャ → きゃ. */
export const otherScript = (kana: string) => (toHiragana(kana) === kana ? toKatakana(kana) : toHiragana(kana));

/** Characters that sound like another one, so that one's romaji counts too: ぢ like じ (ji), づ like ず (zu), を like お (o). */
const SOUNDS_LIKE: Record<string, string> = { ぢ: "じ", づ: "ず", を: "お" };

/**
 * Whether the typed text is the reading of the character. Forgiving: case and spaces don't matter, other ways of
 * writing romaji count (si, ti, tu, hu, zi, sya, nn), and so do kana typed with a Japanese keyboard, in either script.
 */
export function isRightKana(typed: string, kana: string): boolean {
    const input = typed.trim().toLowerCase().replace(/\s/g, "");
    if (!input) return false;
    const target = toHiragana(kana);
    if (isKana(input)) return toHiragana(input) === target;
    const typedKana = [toHiragana(input), toHiragana(input, { IMEMode: true })];
    return typedKana.some((candidate) => candidate === target || candidate === SOUNDS_LIKE[target]);
}
