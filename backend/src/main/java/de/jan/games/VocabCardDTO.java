package de.jan.games;

public record VocabCardDTO(String word, int box, long dueAt) {

    public static VocabCardDTO of(VocabCard card) {
        return new VocabCardDTO(card.getWord(), card.getBox(), card.getDueAt());
    }
}
