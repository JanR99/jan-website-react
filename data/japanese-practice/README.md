# japanese-practice word lists

`hiragana.json`, `katakana.json` and `kanji.json`, unchanged, as in [JanR99/japanese-practice](https://github.com/JanR99/japanese-practice)
(`public/`, commit `e04f4b9`, 2025-08-22). They come from
[vbvss199/Language-Learning-decks](https://github.com/vbvss199/Language-Learning-decks) (`japanese/`, uploaded 2025-06-02).

## Licenses

- Language-Learning-decks: MIT License, Copyright (c) 2025 GENERAL NEURO. According to its README the lists were made
  with Gemini from word frequency lists.
- The word frequencies come from [wordfreq](https://github.com/rspeer/wordfreq) by Robyn Speer, whose data is licensed
  under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (Robyn Speer. (2022). rspeer/wordfreq: v3.0 (v3.0.2).
  Zenodo. https://doi.org/10.5281/zenodo.7199437). The lists here and the game files built from them are shared under
  CC BY-SA 4.0 as well.

Both are named on the page `/lizenzen` of the website.

The games don't load these files: `npm run words` builds the smaller `public/games/japanese-words.json` (kana words, for the crossword)
and `public/games/japanese-kanji.json` (kanji words with their romaji reading, for "Kanji lesen") from them
(see `scripts/build-japanese-words.ts`). After updating the lists here, run it again.
