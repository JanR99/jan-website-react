package de.jan.games;

/** A word read wrong in "Kanji lesen", stored inside the user's KanjiStats until it is read right twice in a row. */
public class KanjiMistake {

    /** the word in kanji, like "本" */
    private String word;
    /** its reading and meaning as the game showed them, so the list can be shown without the word list */
    private String reading;
    private String meaning;
    /** how often it was read wrong */
    private int wrong;
    /** how often it was read right since the last time it was wrong */
    private int rightInRow;
    /** when it was first read wrong, in milliseconds since 1970 */
    private long addedAt;

    public KanjiMistake() {
    }

    public KanjiMistake(String word, String reading, String meaning, long addedAt) {
        this.word = word;
        this.reading = reading;
        this.meaning = meaning;
        this.addedAt = addedAt;
    }

    public String getWord() { return word; }

    public String getReading() { return reading == null ? "" : reading; }
    public void setReading(String reading) { this.reading = reading; }

    public String getMeaning() { return meaning == null ? "" : meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }

    public int getWrong() { return wrong; }
    public void setWrong(int wrong) { this.wrong = wrong; }

    public int getRightInRow() { return rightInRow; }
    public void setRightInRow(int rightInRow) { this.rightInRow = rightInRow; }

    public long getAddedAt() { return addedAt; }
}
