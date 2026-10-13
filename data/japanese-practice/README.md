# japanese-practice word lists

`hiragana.json`, `katakana.json` and `kanji.json` from [JanR99/japanese-practice](https://github.com/JanR99/japanese-practice)
(`public/`, commit `e04f4b9`, 2025-08-22), unchanged.

The games don't load these files: `npm run words` builds the smaller `public/games/japanese-words.json` (kana words, for the crossword)
and `public/games/japanese-kanji.json` (kanji words with their romaji reading, for "Kanji lesen") from them
(see `scripts/build-japanese-words.ts`). After updating the lists here, run it again.
