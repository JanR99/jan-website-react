package de.jan.games;

public record VocabMistakeDTO(String word, String reading, String meaning, int wrong, int rightInRow) {

    public static VocabMistakeDTO of(VocabMistake mistake) {
        return new VocabMistakeDTO(mistake.getWord(), mistake.getReading(), mistake.getMeaning(),
                mistake.getWrong(), mistake.getRightInRow());
    }
}
