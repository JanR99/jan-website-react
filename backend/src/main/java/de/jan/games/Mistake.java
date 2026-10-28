package de.jan.games;

/**
 * An entry on the list of mistakes of a reading game, stored inside the user's stats until it is read right
 * twice in a row; the rules are in MistakeList. Not stored on its own: its fields are stored with each subclass.
 */
public abstract class Mistake {

    /** how often it was read wrong */
    private int wrong;
    /** how often it was read right since the last time it was wrong */
    private int rightInRow;
    /** when it was first read wrong, in milliseconds since 1970 */
    private long addedAt;

    /** for Objectify */
    protected Mistake() {
    }

    protected Mistake(long addedAt) {
        this.addedAt = addedAt;
    }

    /** What was read wrong, like the character or the word; the list has one entry per key. */
    public abstract String getKey();

    /** Takes over what the game showed when the entry was read wrong once more; nothing by default. */
    public void refresh(Mistake asked) {
    }

    public int getWrong() { return wrong; }
    public void setWrong(int wrong) { this.wrong = wrong; }

    public int getRightInRow() { return rightInRow; }
    public void setRightInRow(int rightInRow) { this.rightInRow = rightInRow; }

    public long getAddedAt() { return addedAt; }
}
