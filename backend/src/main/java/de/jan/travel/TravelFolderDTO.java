package de.jan.travel;

import java.util.List;

public class TravelFolderDTO {

    private Long id;
    private String name;
    private String country;
    private Long coverPhotoId;
    private List<TravelStopDTO> stops;
    private Long previousFolderId;
    private String startMonth;
    private String endMonth;
    private String text;
    private String cuisine;
    private List<TravelPhotoDTO> photos;

    /** @param photos the photos of the folder in the order they are shown */
    public static TravelFolderDTO from(TravelFolder folder, List<TravelPhoto> photos) {
        TravelFolderDTO dto = new TravelFolderDTO();
        dto.id = folder.getId();
        dto.name = folder.getName();
        dto.country = folder.getCountry();
        dto.stops = folder.getStops().stream().map(TravelStopDTO::from).toList();
        dto.previousFolderId = folder.getPreviousFolderId();
        dto.startMonth = folder.getStartMonth();
        dto.endMonth = folder.getEndMonth();
        dto.text = folder.getText();
        dto.cuisine = folder.getCuisine();
        dto.photos = photos.stream().map(TravelPhotoDTO::from).toList();
        // the chosen cover, otherwise the first photo
        Long cover = folder.getCoverPhotoId();
        boolean coverExists = cover != null && dto.photos.stream().anyMatch(photo -> cover.equals(photo.getId()));
        dto.coverPhotoId = coverExists
                ? cover
                : dto.photos.stream().findFirst().map(TravelPhotoDTO::getId).orElse(null);
        return dto;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCountry() { return country; }
    /** null if the folder has no photos yet */
    public Long getCoverPhotoId() { return coverPhotoId; }
    /** the places of the trip in its order; empty if the folder has no place on the map */
    public List<TravelStopDTO> getStops() { return stops; }
    /** the folder the trip came from, null if there is none */
    public Long getPreviousFolderId() { return previousFolderId; }
    /** year and month like "2024-05", null if it is not known when the trip was */
    public String getStartMonth() { return startMonth; }
    /** null for a trip within one month */
    public String getEndMonth() { return endMonth; }
    /** empty if the folder has none */
    public String getText() { return text; }
    /** the cuisine of the cookbook that belongs to the trip, like "japanisch"; empty if there is none */
    public String getCuisine() { return cuisine; }
    public List<TravelPhotoDTO> getPhotos() { return photos; }
}
