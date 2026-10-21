package de.jan.games;

/** A character on the user's list of mistakes in "Kana lesen", as the frontend gets it. */
public record KanaMistakeDTO(String kana, int wrong, int rightInRow) {

    public static KanaMistakeDTO of(KanaMistake mistake) {
        return new KanaMistakeDTO(mistake.getKana(), mistake.getWrong(), mistake.getRightInRow());
    }
}
