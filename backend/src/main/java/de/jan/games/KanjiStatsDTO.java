package de.jan.games;

import java.util.List;

/**
 * The "Kanji lesen" statistics of the logged-in user, as the frontend gets them.
 *
 * @param rounds        rounds played to the end, in total
 * @param perfectRounds rounds with every word right, in total
 * @param currentStreak words read right in a row
 */
public record KanjiStatsDTO(int rounds, int perfectRounds, int rightWords, int askedWords,
                            int currentStreak, int bestStreak, List<LevelStats> levels) {

    /** the numbers of one level; only levels the user has played are listed */
    public record LevelStats(String level, int rounds, int perfectRounds, int rightWords, int askedWords) { }
}
