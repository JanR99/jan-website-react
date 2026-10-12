# japanese-practice word lists

`hiragana.json`, `katakana.json` and `kanji.json` from [JanR99/japanese-practice](https://github.com/JanR99/japanese-practice)
(`public/`, commit `e04f4b9`, 2025-08-22), unchanged.

The games don't load these files. `kanji.json` isn't used yet (its words have no kana reading, only romaji); `npm run words` builds the smaller `public/games/japanese-words.json`
from them (see `scripts/build-japanese-words.ts`). After updating the lists here, run it again.
