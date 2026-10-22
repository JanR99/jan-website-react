package de.jan.travel;

import java.util.List;

/**
 * @param coverPhotoId     null if the folder has no photos yet
 * @param stops            the places of the trip in its order; empty if the folder has no place on the map
 * @param previousFolderId the folder the trip came from, null if there is none
 * @param startMonth       year and month like "2024-05", null if it is not known when the trip was
 * @param endMonth         null for a trip within one month
 * @param text             empty if the folder has none
 * @param cuisine          the cuisine of the cookbook that belongs to the trip, like "japanisch"; empty if there is none
 */
public record TravelFolderDTO(Long id, String name, String country, Long coverPhotoId, List<TravelStopDTO> stops,
                              Long previousFolderId, String startMonth, String endMonth, String text, String cuisine,
                              List<TravelPhotoDTO> photos) {

    /** @param photos the photos of the folder in the order they are shown */
    public static TravelFolderDTO from(TravelFolder folder, List<TravelPhoto> photos) {
        List<TravelPhotoDTO> photoDTOs = photos.stream().map(TravelPhotoDTO::from).toList();
        // the chosen cover, otherwise the first photo
        Long cover = folder.getCoverPhotoId();
        boolean coverExists = cover != null && photoDTOs.stream().anyMatch(photo -> cover.equals(photo.id()));
        Long coverPhotoId = coverExists
                ? cover
                : photoDTOs.stream().findFirst().map(TravelPhotoDTO::id).orElse(null);
        return new TravelFolderDTO(folder.getId(), folder.getName(), folder.getCountry(), coverPhotoId,
                folder.getStops().stream().map(TravelStopDTO::from).toList(), folder.getPreviousFolderId(),
                folder.getStartMonth(), folder.getEndMonth(), folder.getText(), folder.getCuisine(), photoDTOs);
    }
}
