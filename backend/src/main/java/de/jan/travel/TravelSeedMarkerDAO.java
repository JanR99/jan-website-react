package de.jan.travel;

import de.jan.objectify.BaseDAO;

public class TravelSeedMarkerDAO extends BaseDAO<TravelSeedMarker, String> {

    public TravelSeedMarkerDAO() {
        super(TravelSeedMarker.class);
    }
}
