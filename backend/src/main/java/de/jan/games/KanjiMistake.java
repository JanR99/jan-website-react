package de.jan.games;

/** A word read wrong in "Kanji lesen", stored inside the user's KanjiStats until it is read right twice in a row. */
public class KanjiMistake extends Mistake {

    /** the word in kanji, like "本" */
    private String word;
    /** its reading and meaning as the game showed them, so the list can be shown without the word list */
    private String reading;
    private String meaning;

    public KanjiMistake() {
    }

    public KanjiMistake(String word, String reading, String meaning, long addedAt) {
        super(addedAt);
        this.word = word;
        this.reading = reading;
        this.meaning = meaning;
    }

    public String getWord() { return word; }

    public String getReading() { return reading == null ? "" : reading; }

    public String getMeaning() { return meaning == null ? "" : meaning; }

    @Override
    public String getKey() { return word; }

    /** the word list may have changed since, so the list shows reading and meaning as the game showed them last */
    @Override
    public void refresh(Mistake asked) {
        if (asked instanceof KanjiMistake kanji) {
            reading = kanji.reading;
            meaning = kanji.meaning;
        }
    }
}
