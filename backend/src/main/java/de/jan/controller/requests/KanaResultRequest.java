package de.jan.controller.requests;

import java.util.List;

/**
 * The end of a round of "Kana lesen".
 *
 * @param answers  for each character of the round, in order: whether it was read right ("Weiß ich nicht" counts as wrong)
 * @param kana     the characters of the round, in the same order as the answers, like "し" or "キャ"
 * @param practice true for a round of the own mistakes: it changes only the list of mistakes, not the statistics;
 *                 missing counts as false
 */
public record KanaResultRequest(List<Boolean> answers, List<String> kana, Boolean practice) {
}
