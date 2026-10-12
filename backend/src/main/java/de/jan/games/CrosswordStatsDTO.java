package de.jan.games;

import java.util.List;

/** The crossword statistics of the logged-in user, as the frontend gets them. */
public class CrosswordStatsDTO {

    /** the numbers of one script and level; only combinations the user has played are listed */
    public record LevelStats(String script, String level, int solved, int words) { }

    private int solved;
    private int words;
    private int currentStreak;
    private int bestStreak;
    private List<LevelStats> levels;

    public CrosswordStatsDTO(int solved, int words, int currentStreak, int bestStreak, List<LevelStats> levels) {
        this.solved = solved;
        this.words = words;
        this.currentStreak = currentStreak;
        this.bestStreak = bestStreak;
        this.levels = levels;
    }

    /** crosswords solved in total */
    public int getSolved() { return solved; }
    /** words got right in total */
    public int getWords() { return words; }
    public int getCurrentStreak() { return currentStreak; }
    public int getBestStreak() { return bestStreak; }
    public List<LevelStats> getLevels() { return levels; }
}
