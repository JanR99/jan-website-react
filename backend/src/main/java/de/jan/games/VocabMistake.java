package de.jan.games;

public class VocabMistake extends Mistake {

    private String word;
    private String reading;
    private String meaning;

    @SuppressWarnings("unused")
    public VocabMistake() {
    }

    public VocabMistake(String word, String reading, String meaning, long addedAt) {
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

    @Override
    public void refresh(Mistake asked) {
        if (asked instanceof VocabMistake vocab) {
            reading = vocab.reading;
            meaning = vocab.meaning;
        }
    }
}
