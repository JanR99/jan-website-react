package de.jan.games;

import de.jan.objectify.BaseDAO;

public class KanjiStatsDAO extends BaseDAO<KanjiStats, Long> {

    public KanjiStatsDAO() {
        super(KanjiStats.class);
    }
}
