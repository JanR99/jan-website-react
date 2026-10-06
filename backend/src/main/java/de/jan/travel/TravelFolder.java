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

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
