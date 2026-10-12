package de.jan.games;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.HashMap;
import java.util.Map;

/** What a user has achieved in the Japanese crossword; one per user, with the user's id as its id. */
@Entity
public class CrosswordStats implements DatastoreEntity {

    @Id
    private Long userId;

    /** "hiragana-A1" → crosswords solved without help ("Feld aufdecken" or "Lösung zeigen") */
    private Map<String, Integer> solved = new HashMap<>();

    /** "hiragana-A1" → words the user got right without having them shown */
    private Map<String, Integer> words = new HashMap<>();

    /** crosswords solved without help in a row, ended by one finished with help */
    private int currentStreak;

    private int bestStreak;

    public CrosswordStats() {
    }

    public CrosswordStats(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() { return userId; }

    public Map<String, Integer> getSolved() {
        if (solved == null) solved = new HashMap<>();
        return solved;
    }

    public Map<String, Integer> getWords() {
        if (words == null) words = new HashMap<>();
        return words;
    }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getBestStreak() { return bestStreak; }
    public void setBestStreak(int bestStreak) { this.bestStreak = bestStreak; }
}
