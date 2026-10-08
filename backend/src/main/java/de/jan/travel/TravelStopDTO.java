package de.jan.travel;

public class TravelStopDTO {

    private String name;
    private double latitude;
    private double longitude;

    public static TravelStopDTO from(TravelStop stop) {
        TravelStopDTO dto = new TravelStopDTO();
        dto.name = stop.getName();
        dto.latitude = stop.getLatitude();
        dto.longitude = stop.getLongitude();
        return dto;
    }

    /** empty if the stop has none */
    public String getName() { return name; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}
