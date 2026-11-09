package de.jan.games;

import de.jan.objectify.BaseDAO;

public class VocabStatsDAO extends BaseDAO<VocabStats, Long> {

    public VocabStatsDAO() {
        super(VocabStats.class);
    }
}
