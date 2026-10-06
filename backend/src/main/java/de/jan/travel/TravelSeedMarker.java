package de.jan.travel;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.Date;

/**
 * Stored once all folders and photos of resources/travel/folders.json have been imported, so the
 * import never runs again and folders or photos deleted later don't come back.
 */
@Entity
public class TravelSeedMarker implements DatastoreEntity {

    public static final String ID = "travel";

    @Id
    private String id;

    private Date completedAt;

    public TravelSeedMarker() {

    }

    public TravelSeedMarker(Date completedAt) {
        this.id = ID;
        this.completedAt = completedAt;
    }

    public String getId() { return id; }
    public Date getCompletedAt() { return completedAt; }
}
