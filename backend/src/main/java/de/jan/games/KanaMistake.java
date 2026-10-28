package de.jan.games;

/** A character read wrong in "Kana lesen", stored inside the user's KanaStats until it is read right twice in a row. */
public class KanaMistake extends Mistake {

    /** the character, like "し" or "キャ" */
    private String kana;

    @SuppressWarnings("unused")
    public KanaMistake() {
    }

    public KanaMistake(String kana, long addedAt) {
        super(addedAt);
        this.kana = kana;
    }

    public String getKana() { return kana; }

    @Override
    public String getKey() { return kana; }
}
