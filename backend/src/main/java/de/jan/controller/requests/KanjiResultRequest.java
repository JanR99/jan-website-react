package de.jan.controller.requests;

import java.util.List;

/**
 * The end of a round of "Kanji lesen".
 *
 * @param level    the level it was played at, "A1" to "C2"; not needed for a round of mistakes
 * @param answers  for each word of the round, in order: whether it was read right ("Weiß ich nicht" counts as wrong)
 * @param words    the words of the round, in the same order as the answers
 * @param practice true for a round of the own mistakes: it changes only the list of mistakes, not the statistics;
 *                 missing counts as false
 */
public record KanjiResultRequest(String level, List<Boolean> answers, List<Word> words, Boolean practice) {

    /**
     * A word of the round, as the game showed it; goes on the list of mistakes when it was read wrong.
     *
     * @param word the word in kanji, like "本"
     */
    public record Word(String word, String reading, String meaning) {
    }
}
