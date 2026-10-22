package de.jan.games;

import java.util.List;

/**
 * The crossword statistics of the logged-in user, as the frontend gets them.
 *
 * @param solved crosswords solved in total
 * @param words  words got right in total
 */
public record CrosswordStatsDTO(int solved, int words, int currentStreak, int bestStreak, List<LevelStats> levels) {

    /** the numbers of one script and level; only combinations the user has played are listed */
    public record LevelStats(String script, String level, int solved, int words) { }
}
