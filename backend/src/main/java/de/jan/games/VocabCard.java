package de.jan.games;

public class VocabCard {

    private String word;
    private int box;
    private long dueAt;

    @SuppressWarnings("unused")
    public VocabCard() {
    }

    public VocabCard(String word) {
        this.word = word;
    }

    public String getWord() { return word; }

    public int getBox() { return box; }
    public void setBox(int box) { this.box = box; }

    public long getDueAt() { return dueAt; }
    public void setDueAt(long dueAt) { this.dueAt = dueAt; }
}
