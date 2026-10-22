package de.jan.games;

import java.util.List;

/** The "Kana lesen" statistics of the logged-in user, as the frontend gets them. */
public class KanaStatsDTO {

    /** the numbers of one script ("hiragana", "katakana"); only scripts the user has been asked are listed */
    public record ScriptStats(String script, int rightKana, int askedKana) { }

    private final int rounds;
    private final int perfectRounds;
    private final int rightKana;
    private final int askedKana;
    private final int currentStreak;
    private final int bestStreak;
    private final List<ScriptStats> scripts;

    public KanaStatsDTO(int rounds, int perfectRounds, int rightKana, int askedKana,
                        int currentStreak, int bestStreak, List<ScriptStats> scripts) {
        this.rounds = rounds;
        this.perfectRounds = perfectRounds;
        this.rightKana = rightKana;
        this.askedKana = askedKana;
        this.currentStreak = currentStreak;
        this.bestStreak = bestStreak;
        this.scripts = scripts;
    }

    /** rounds played to the end */
    public int getRounds() { return rounds; }
    /** rounds with every character right */
    public int getPerfectRounds() { return perfectRounds; }
    public int getRightKana() { return rightKana; }
    public int getAskedKana() { return askedKana; }
    /** characters read right in a row */
    public int getCurrentStreak() { return currentStreak; }
    public int getBestStreak() { return bestStreak; }
    public List<ScriptStats> getScripts() { return scripts; }
}
