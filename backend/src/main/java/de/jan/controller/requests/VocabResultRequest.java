package de.jan.controller.requests;

import java.util.List;

/**
 * The end of a round of "Vokabeln".
 *
 * @param level    the level of the words, "A1" to "C2"; not needed for a round of mistakes
 * @param answers  for each word of the round, in order: whether it was answered right
 * @param words    the words of the round, in the same order as the answers
 * @param practice true for a round of the own mistakes: it changes only the list of mistakes; missing counts as false
 */
public record VocabResultRequest(String level, List<Boolean> answers, List<Word> words, Boolean practice) {

    public record Word(String word, String reading, String meaning) {
    }
}
