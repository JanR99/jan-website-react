package de.jan.travel;

/** @param name empty if the stop has none */
public record TravelStopDTO(String name, double latitude, double longitude) {

    public static TravelStopDTO from(TravelStop stop) {
        return new TravelStopDTO(stop.getName(), stop.getLatitude(), stop.getLongitude());
    }
}
