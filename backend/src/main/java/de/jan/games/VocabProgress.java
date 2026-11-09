package de.jan.games;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
public class VocabProgress implements DatastoreEntity {

    /** like "12:A1" */
    @Id
    private String id;

    private List<VocabCard> cards = new ArrayList<>();

    @SuppressWarnings("unused")
    public VocabProgress() {
    }

    public VocabProgress(Long userId, String level) {
        this.id = idOf(userId, level);
    }

    public static String idOf(Long userId, String level) {
        return userId + ":" + level;
    }

    public String getId() { return id; }

    public List<VocabCard> getCards() {
        if (cards == null) cards = new ArrayList<>();
        return cards;
    }
}
