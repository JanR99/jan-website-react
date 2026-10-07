package de.jan.controller.requests;

public class TravelFolderRequest {

    private String name;
    private String country;

    /** the place on the map; both empty for a folder without one */
    private Double latitude;
    private Double longitude;

    /** when the trip was, as year and month like "2024-05"; both empty if that is not known */
    private String startMonth;
    private String endMonth;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getStartMonth() { return startMonth; }
    public void setStartMonth(String startMonth) { this.startMonth = startMonth; }

    public String getEndMonth() { return endMonth; }
    public void setEndMonth(String endMonth) { this.endMonth = endMonth; }
}
