package de.jan.controller.requests;

import java.util.List;

public class TravelFolderRequest {

    private String name;
    private String country;

    /** the places of the trip in its order; empty for a folder without a place on the map */
    private List<TravelStopRequest> stops;

    /** the folder the trip came from, e.g. Portugal for the Spanish part of a trip; empty for none */
    private Long previousFolderId;

    /** when the trip was, as year and month like "2024-05"; both empty if that is not known */
    private String startMonth;
    private String endMonth;

    /** the cuisine of the cookbook that belongs to the trip, like "japanisch"; empty for none */
    private String cuisine;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public List<TravelStopRequest> getStops() { return stops; }
    public void setStops(List<TravelStopRequest> stops) { this.stops = stops; }

    public Long getPreviousFolderId() { return previousFolderId; }
    public void setPreviousFolderId(Long previousFolderId) { this.previousFolderId = previousFolderId; }

    public String getStartMonth() { return startMonth; }
    public void setStartMonth(String startMonth) { this.startMonth = startMonth; }

    public String getEndMonth() { return endMonth; }
    public void setEndMonth(String endMonth) { this.endMonth = endMonth; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }
}
