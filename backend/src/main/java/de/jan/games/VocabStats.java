package de.jan.games;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
public class VocabStats implements DatastoreEntity, MistakeStats<VocabMistake> {

    @Id
    private Long userId;

    private int rounds;
    private int perfectRounds;
    private int rightWords;
    private int askedWords;
    private int currentStreak;
    private int bestStreak;
    private List<VocabMistake> mistakes = new ArrayList<>();

    @SuppressWarnings("unused")
    public VocabStats() {
    }

    public VocabStats(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() { return userId; }

    public int getRounds() { return rounds; }
    public void setRounds(int rounds) { this.rounds = rounds; }

    public int getPerfectRounds() { return perfectRounds; }
    public void setPerfectRounds(int perfectRounds) { this.perfectRounds = perfectRounds; }

    public int getRightWords() { return rightWords; }
    public void setRightWords(int rightWords) { this.rightWords = rightWords; }

    public int getAskedWords() { return askedWords; }
    public void setAskedWords(int askedWords) { this.askedWords = askedWords; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getBestStreak() { return bestStreak; }
    public void setBestStreak(int bestStreak) { this.bestStreak = bestStreak; }

    @Override
    public List<VocabMistake> getMistakes() {
        if (mistakes == null) mistakes = new ArrayList<>();
        return mistakes;
    }
}
