package de.jan.games;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** What a user has achieved in "Kanji lesen"; one per user, with the user's id as its id. */
@Entity
public class KanjiStats implements DatastoreEntity, MistakeStats<KanjiMistake> {

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

    /** the words read wrong and not yet read right twice in a row since */
    private List<KanjiMistake> mistakes = new ArrayList<>();

    @SuppressWarnings("unused")
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

    @Override
    public List<KanjiMistake> getMistakes() {
        if (mistakes == null) mistakes = new ArrayList<>();
        return mistakes;
    }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getBestStreak() { return bestStreak; }
    public void setBestStreak(int bestStreak) { this.bestStreak = bestStreak; }
}
