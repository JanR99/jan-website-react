export const GAMES_BASE = "/spiele";
export const CROSSWORD_PATH = `${GAMES_BASE}/kreuzwortraetsel`;
export const KANJI_PATH = `${GAMES_BASE}/kanji`;
export const KANA_PATH = `${GAMES_BASE}/kana`;
/** with this parameter the kanji game starts with a round of the own mistakes */
export const PRACTICE_PARAM = "fehler";
export const KANJI_PRACTICE_PATH = `${KANJI_PATH}?${PRACTICE_PARAM}`;
