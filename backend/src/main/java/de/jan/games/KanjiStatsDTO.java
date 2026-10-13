package de.jan.games;

import java.util.List;

/** The "Kanji lesen" statistics of the logged-in user, as the frontend gets them. */
public class KanjiStatsDTO {

    /** the numbers of one level; only levels the user has played are listed */
    public record LevelStats(String level, int rounds, int perfectRounds, int rightWords, int askedWords) { }

    private int rounds;
    private int perfectRounds;
    private int rightWords;
    private int askedWords;
    private int currentStreak;
    private int bestStreak;
    private List<LevelStats> levels;

    public KanjiStatsDTO(int rounds, int perfectRounds, int rightWords, int askedWords,
                         int currentStreak, int bestStreak, List<LevelStats> levels) {
        this.rounds = rounds;
        this.perfectRounds = perfectRounds;
        this.rightWords = rightWords;
        this.askedWords = askedWords;
        this.currentStreak = currentStreak;
        this.bestStreak = bestStreak;
        this.levels = levels;
    }

    /** rounds played to the end, in total */
    public int getRounds() { return rounds; }
    /** rounds with every word right, in total */
    public int getPerfectRounds() { return perfectRounds; }
    public int getRightWords() { return rightWords; }
    public int getAskedWords() { return askedWords; }
    /** words read right in a row */
    public int getCurrentStreak() { return currentStreak; }
    public int getBestStreak() { return bestStreak; }
    public List<LevelStats> getLevels() { return levels; }
}
