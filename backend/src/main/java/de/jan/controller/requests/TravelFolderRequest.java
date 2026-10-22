package de.jan.controller.requests;

import java.util.List;

/**
 * @param stops            the places of the trip in its order; empty for a folder without a place on the map
 * @param previousFolderId the folder the trip came from, e.g. Portugal for the Spanish part of a trip; empty for none
 * @param startMonth       when the trip was, as year and month like "2024-05"; both months empty if that is not known
 * @param cuisine          the cuisine of the cookbook that belongs to the trip, like "japanisch"; empty for none
 */
public record TravelFolderRequest(String name, String country, List<TravelStopRequest> stops, Long previousFolderId,
                                  String startMonth, String endMonth, String cuisine) {

    /** A folder with nothing but its name and country. */
    public TravelFolderRequest(String name, String country) {
        this(name, country, null, null, null, null, null);
    }

    public TravelFolderRequest withStops(List<TravelStopRequest> stops) {
        return new TravelFolderRequest(name, country, stops, previousFolderId, startMonth, endMonth, cuisine);
    }

    public TravelFolderRequest withPreviousFolderId(Long previousFolderId) {
        return new TravelFolderRequest(name, country, stops, previousFolderId, startMonth, endMonth, cuisine);
    }
}
