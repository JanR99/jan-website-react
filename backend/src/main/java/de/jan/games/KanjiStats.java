package de.jan.games;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.HashMap;
import java.util.Map;

/** What a user has achieved in "Kanji lesen"; one per user, with the user's id as its id. */
@Entity
public class KanjiStats implements DatastoreEntity {

    @Id
    private Long userId;

    /** level ("A1") → rounds played to the end */
    private Map<String, Integer> rounds = new HashMap<>();

    /** level → rounds with every word right */
    private Map<String, Integer> perfectRounds = new HashMap<>();

    /** level → words read right */
    private Map<String, Integer> rightWords = new HashMap<>();

    /** level → words asked */
    private Map<String, Integer> askedWords = new HashMap<>();

    /** words read right in a row, across rounds, ended by a wrong one */
    private int currentStreak;

    private int bestStreak;

    public KanjiStats() {
    }

    public KanjiStats(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() { return userId; }

    public Map<String, Integer> getRounds() {
        if (rounds == null) rounds = new HashMap<>();
        return rounds;
    }

    public Map<String, Integer> getPerfectRounds() {
        if (perfectRounds == null) perfectRounds = new HashMap<>();
        return perfectRounds;
    }

    public Map<String, Integer> getRightWords() {
        if (rightWords == null) rightWords = new HashMap<>();
        return rightWords;
    }

    public Map<String, Integer> getAskedWords() {
        if (askedWords == null) askedWords = new HashMap<>();
        return askedWords;
    }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getBestStreak() { return bestStreak; }
    public void setBestStreak(int bestStreak) { this.bestStreak = bestStreak; }
}
