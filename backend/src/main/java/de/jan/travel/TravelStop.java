package de.jan.travel;

/** A place the trip went to, stored inside its TravelFolder; the stops of a folder are kept in the order of the trip. */
public class TravelStop {

    /** like "Sevilla"; may be empty */
    private String name;

    private double latitude;

    private double longitude;

    public TravelStop() {

    }

    public TravelStop(String name, double latitude, double longitude) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getName() { return name == null ? "" : name; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}
