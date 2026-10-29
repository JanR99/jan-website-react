package de.jan.travel.repository;

import de.jan.travel.TravelSeedMarker;
import de.jan.travel.TravelSeedMarkerDAO;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class TravelSeedMarkerRepository {

    private final TravelSeedMarkerDAO seedMarkerDAO = new TravelSeedMarkerDAO();

    /** Whether the folders of resources/travel/folders.json have all been imported, see TravelSeedMarker. */
    public boolean isImported() {
        return seedMarkerDAO.exists(TravelSeedMarker.ID);
    }

    public void markImported() {
        seedMarkerDAO.save(new TravelSeedMarker(new Date()));
    }
}
