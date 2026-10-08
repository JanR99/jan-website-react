package de.jan.travel;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/** A folder of the travel diary, one per trip. Its photos are TravelPhoto entities that refer to it. */
@Entity
public class TravelFolder implements DatastoreEntity {

    @Id
    private Long id;

    private String name;

    /** empty if the trip has no country worth showing, e.g. when the name already is the country */
    private String country;

    /** id of the TravelPhoto shown on the folder; null means the first photo */
    private Long coverPhotoId;

    /**
     * The one place on the map of folders saved before there were stops; such a folder shows it as
     * its only stop, see getStops(). Cleared as soon as the folder is saved with stops.
     */
    private Double latitude;
    private Double longitude;

    /** the places of the trip in its order */
    private List<TravelStop> stops = new ArrayList<>();

    /** the folder the trip came from; the line on the map goes from its last stop to the first one of this folder */
    private Long previousFolderId;

    /** when the trip was, as year and month like "2024-05"; both null if that is not known */
    private String startMonth;
    /** null for a trip within one month */
    private String endMonth;

    /** what the diary says about the trip, paragraphs separated by an empty line */
    private String text;

    /** the cuisine of the cookbook that belongs to the trip, like "japanisch"; its recipes are shown with the trip */
    private String cuisine;

    private Date createdAt;

    public TravelFolder() {

    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country == null ? "" : country; }
    public void setCountry(String country) { this.country = country; }

    public Long getCoverPhotoId() { return coverPhotoId; }
    public void setCoverPhotoId(Long coverPhotoId) { this.coverPhotoId = coverPhotoId; }

    /** The stops in the order of the trip; a folder saved before there were stops has its one place as the only stop. */
    public List<TravelStop> getStops() {
        if ((stops == null || stops.isEmpty()) && latitude != null && longitude != null) {
            return List.of(new TravelStop(name, latitude, longitude));
        }
        return stops == null ? List.of() : stops;
    }

    public void setStops(List<TravelStop> stops) {
        this.stops = new ArrayList<>(stops);
        this.latitude = null;
        this.longitude = null;
    }

    /** Only for folders as they were stored before there were stops, and for testing those. */
    public void setLegacyPosition(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getPreviousFolderId() { return previousFolderId; }
    public void setPreviousFolderId(Long previousFolderId) { this.previousFolderId = previousFolderId; }

    public String getStartMonth() { return startMonth; }
    public String getEndMonth() { return endMonth; }

    public void setPeriod(String startMonth, String endMonth) {
        this.startMonth = startMonth;
        this.endMonth = endMonth;
    }

    public String getText() { return text == null ? "" : text; }
    public void setText(String text) { this.text = text; }

    public String getCuisine() { return cuisine == null ? "" : cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
