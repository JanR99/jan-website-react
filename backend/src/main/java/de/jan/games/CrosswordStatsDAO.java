package de.jan.games;

import de.jan.objectify.BaseDAO;

public class CrosswordStatsDAO extends BaseDAO<CrosswordStats, Long> {

    public CrosswordStatsDAO() {
        super(CrosswordStats.class);
    }
}
