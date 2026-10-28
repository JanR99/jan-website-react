package de.jan.games;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** What a user has achieved in "Kana lesen"; one per user, with the user's id as its id. */
@Entity
public class KanaStats implements DatastoreEntity {

    @Id
    private Long userId;

    /** rounds played to the end */
    private int rounds;

    /** rounds with every character right */
    private int perfectRounds;

    /** script ("hiragana", "katakana") → characters read right */
    private Map<String, Integer> rightKana = new HashMap<>();

    /** script → characters asked */
    private Map<String, Integer> askedKana = new HashMap<>();

    /** characters read right in a row, across rounds, ended by a wrong one */
    private int currentStreak;

    private int bestStreak;

    /** the characters read wrong and not yet read right twice in a row since */
    private List<KanaMistake> mistakes = new ArrayList<>();

    @SuppressWarnings("unused")
    public KanaStats() {
    }

    public KanaStats(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() { return userId; }

    public int getRounds() { return rounds; }
    public void setRounds(int rounds) { this.rounds = rounds; }

    public int getPerfectRounds() { return perfectRounds; }
    public void setPerfectRounds(int perfectRounds) { this.perfectRounds = perfectRounds; }

    public Map<String, Integer> getRightKana() {
        if (rightKana == null) rightKana = new HashMap<>();
        return rightKana;
    }

    public Map<String, Integer> getAskedKana() {
        if (askedKana == null) askedKana = new HashMap<>();
        return askedKana;
    }

    public List<KanaMistake> getMistakes() {
        if (mistakes == null) mistakes = new ArrayList<>();
        return mistakes;
    }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getBestStreak() { return bestStreak; }
    public void setBestStreak(int bestStreak) { this.bestStreak = bestStreak; }
}
