package de.jan.travel;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.Date;

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

    /** where the trip is shown on the map; both null if the folder has no place on it */
    private Double latitude;
    private Double longitude;

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

    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }

    /** Both values or, to take the folder off the map, both null. */
    public void setPosition(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

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
