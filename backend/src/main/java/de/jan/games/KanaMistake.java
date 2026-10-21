package de.jan.games;

/** A character read wrong in "Kana lesen", stored inside the user's KanaStats until it is read right twice in a row. */
public class KanaMistake {

    /** the character, like "し" or "キャ" */
    private String kana;
    /** how often it was read wrong */
    private int wrong;
    /** how often it was read right since the last time it was wrong */
    private int rightInRow;
    /** when it was first read wrong, in milliseconds since 1970 */
    private long addedAt;

    public KanaMistake() {
    }

    public KanaMistake(String kana, long addedAt) {
        this.kana = kana;
        this.addedAt = addedAt;
    }

    public String getKana() { return kana; }

    public int getWrong() { return wrong; }
    public void setWrong(int wrong) { this.wrong = wrong; }

    public int getRightInRow() { return rightInRow; }
    public void setRightInRow(int rightInRow) { this.rightInRow = rightInRow; }

    public long getAddedAt() { return addedAt; }
}
