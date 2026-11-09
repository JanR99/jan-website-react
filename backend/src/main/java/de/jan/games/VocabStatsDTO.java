package de.jan.games;

import java.util.List;

/**
 * The "Vokabeln" statistics of the logged-in user, as the frontend gets them.
 *
 * @param levels the levels the user has had words of
 */
public record VocabStatsDTO(int rounds, int perfectRounds, int rightWords, int askedWords,
                            int currentStreak, int bestStreak, List<LevelStats> levels) {

    public record LevelStats(String level, int words, int learned) { }
}
