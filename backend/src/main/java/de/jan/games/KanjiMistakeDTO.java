package de.jan.games;

/** A word on the user's list of mistakes in "Kanji lesen", as the frontend gets it. */
public record KanjiMistakeDTO(String word, String reading, String meaning, int wrong, int rightInRow) {

    public static KanjiMistakeDTO of(KanjiMistake mistake) {
        return new KanjiMistakeDTO(mistake.getWord(), mistake.getReading(), mistake.getMeaning(),
                mistake.getWrong(), mistake.getRightInRow());
    }
}
