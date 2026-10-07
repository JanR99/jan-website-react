package de.jan.travel;

import java.util.List;

public class TravelFolderDTO {

    private Long id;
    private String name;
    private String country;
    private Long coverPhotoId;
    private Double latitude;
    private Double longitude;
    private String startMonth;
    private String endMonth;
    private String text;
    private List<TravelPhotoDTO> photos;

    /** @param photos the photos of the folder in the order they are shown */
    public static TravelFolderDTO from(TravelFolder folder, List<TravelPhoto> photos) {
        TravelFolderDTO dto = new TravelFolderDTO();
        dto.id = folder.getId();
        dto.name = folder.getName();
        dto.country = folder.getCountry();
        dto.latitude = folder.getLatitude();
        dto.longitude = folder.getLongitude();
        dto.startMonth = folder.getStartMonth();
        dto.endMonth = folder.getEndMonth();
        dto.text = folder.getText();
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
    /** null if the folder has no place on the map; then the longitude is null as well */
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    /** year and month like "2024-05", null if it is not known when the trip was */
    public String getStartMonth() { return startMonth; }
    /** null for a trip within one month */
    public String getEndMonth() { return endMonth; }
    /** empty if the folder has none */
    public String getText() { return text; }
    public List<TravelPhotoDTO> getPhotos() { return photos; }
}
